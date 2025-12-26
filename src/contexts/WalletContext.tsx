import React, { createContext, useContext, useCallback } from 'react';
import { AptosWalletAdapterProvider, useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";

interface WalletContextType {
  isConnected: boolean;
  account: any | null;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const InnerWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, connected, connect, disconnect, signAndSubmitTransaction: aptosSignAndSubmit } = useAptosWallet();

  const connectWallet = useCallback(async () => {
    try {
      connect("Petra");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, [connect]);

  const disconnectWallet = useCallback(() => {
    try {
      disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  }, [disconnect]);

  const signAndSubmitTransaction = useCallback(async (transaction: any) => {
    try {
      // Validate transaction object
      if (!transaction) {
        throw new Error("Transaction object is undefined");
      }

      // Add gas configuration to ensure sufficient gas for large transactions
      const txWithGas = {
        ...transaction,
        options: {
          max_gas_amount: "200000", // Increased gas limit for large payloads
          gas_unit_price: "100",
          ...(transaction.options || {}),
        }
      };

      console.log("Submitting transaction:", txWithGas);
      return await aptosSignAndSubmit(txWithGas);
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }, [aptosSignAndSubmit]);

  const walletAddress = account?.address?.toString() || null;

  return (
    <WalletContext.Provider value={{
      isConnected: connected,
      account,
      walletAddress,
      connectWallet,
      disconnectWallet,
      signAndSubmitTransaction
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AptosWalletAdapterProvider autoConnect={true}>
      <InnerWalletProvider>
        {children}
      </InnerWalletProvider>
    </AptosWalletAdapterProvider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
