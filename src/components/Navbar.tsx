import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Scale, History, LogOut, Menu, X, Shield } from 'lucide-react';
import Logo from './Logo';
import GlowingButton from './ui/GlowingButton';
import ThemeToggle from './ThemeToggle';
import { useWallet } from '@/contexts/WalletContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { walletAddress, disconnectWallet } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Stations', icon: Building2, path: '/home' },
    { label: 'Police Station', icon: Shield, path: '/police-station' },
    { label: 'Advocates', icon: Scale, path: '/advocates' },
    { label: 'History', icon: History, path: '/history' },
  ];

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border/30"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div
            className="cursor-pointer"
            onClick={() => navigate('/home')}
          >
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === item.path
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Wallet Info, Theme Toggle & Disconnect */}
          <div className="hidden md:flex items-center gap-4">
            {walletAddress && (
              <div className="glass px-3 py-1.5 rounded-lg text-sm">
                <span className="text-muted-foreground">Wallet: </span>
                <span className="text-primary font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
            <ThemeToggle />
            <GlowingButton
              variant="secondary"
              size="sm"
              onClick={handleDisconnect}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Disconnect
            </GlowingButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-glass-border/30"
          >
            <div className="flex flex-col gap-2 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                    }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
              {walletAddress && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  Wallet: <span className="text-primary font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 border-t border-glass-border/30">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-3 px-4 py-3 text-destructive"
              >
                <LogOut size={20} />
                Disconnect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
