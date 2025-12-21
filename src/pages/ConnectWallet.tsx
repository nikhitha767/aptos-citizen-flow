import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, Shield, Lock, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import Logo from '@/components/Logo';
import GlowingButton from '@/components/ui/GlowingButton';
import GlassCard from '@/components/ui/GlassCard';
import { useWallet } from '@/contexts/WalletContext';

const ConnectWallet: React.FC = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnected } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    await connectWallet();
    setIsConnecting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      navigate('/home');
    }, 1500);
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'All complaints recorded on Aptos blockchain',
    },
    {
      icon: Lock,
      title: 'Tamper-Proof',
      description: 'Evidence stored immutably on IPFS',
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Real-time case status notifications',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      
      {/* Gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-display font-bold mb-4"
          >
            <span className="text-foreground">Decentralized</span>{' '}
            <span className="gradient-text">Justice System</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Submit complaints, track cases, and access justice — all secured on blockchain
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
          {features.map((feature, index) => (
            <GlassCard key={index} delay={0.2 + index * 0.1}>
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Connect Wallet Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8" hover={false}>
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center"
                  >
                    <CheckCircle className="text-success" size={40} />
                  </motion.div>
                  <h3 className="text-xl font-display font-semibold mb-2">Wallet Connected!</h3>
                  <p className="text-muted-foreground">Redirecting to dashboard...</p>
                </motion.div>
              ) : (
                <motion.div key="connect" className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-float">
                    <Wallet className="text-primary" size={36} />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-8">
                    Connect your Petra wallet to access CivicChain
                  </p>
                  
                  <GlowingButton
                    variant="primary"
                    size="lg"
                    onClick={handleConnect}
                    loading={isConnecting}
                    className="w-full flex items-center justify-center gap-3"
                  >
                    <img 
                      src="https://petra.app/favicon.ico" 
                      alt="Petra" 
                      className="w-5 h-5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    Connect Petra Wallet
                    <ArrowRight size={18} />
                  </GlowingButton>

                  <p className="text-xs text-muted-foreground mt-6">
                    By connecting, you agree to our{' '}
                    <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <p>Powered by Aptos Blockchain • Secured with IPFS</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectWallet;
