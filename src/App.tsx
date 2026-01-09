import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { WalletProvider, useWallet } from "./contexts/WalletContext";
import ConnectWallet from "./pages/ConnectWallet";
import Home from "./pages/Home";
import ComplaintPage from "./pages/ComplaintPage";
import PoliceStationPage from "./pages/PoliceStationPage";
import AdvocatesPage from "./pages/AdvocatesPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isConnected } = useWallet();

  return (
    <Routes>
      <Route path="/" element={isConnected ? <Navigate to="/home" replace /> : <ConnectWallet />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/complaint" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
      <Route path="/police-station" element={<ProtectedRoute><PoliceStationPage /></ProtectedRoute>} />
      <Route path="/advocates" element={<ProtectedRoute><AdvocatesPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <WalletProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </WalletProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
