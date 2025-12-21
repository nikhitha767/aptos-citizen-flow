import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = true,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 0 30px hsl(180 100% 50% / 0.2)'
      } : undefined}
      className={cn(
        'glass rounded-xl p-6 transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
