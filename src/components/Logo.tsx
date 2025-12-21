import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Link } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
  };

  return (
    <motion.div 
      className="flex items-center gap-3"
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <Shield 
            size={sizes[size].icon} 
            className="text-primary glow-primary"
            strokeWidth={1.5}
          />
          <Link 
            size={sizes[size].icon / 2} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent"
            strokeWidth={2}
          />
        </motion.div>
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold ${sizes[size].text} gradient-text`}>
            CivicChain
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              Blockchain Justice
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Logo;
