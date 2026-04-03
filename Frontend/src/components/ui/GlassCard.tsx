import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  variant?: 'default' | 'hover' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  variant = 'default', 
  padding = 'md', 
  className, 
  children,
}) => {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  if (variant === 'interactive') {
    return (
      <motion.div
        whileHover={{ 
          y: -4,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          'glass-panel cursor-pointer transition-all duration-300',
          paddingSizes[padding],
          'hover:bg-glass-highlight/40 hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_hsla(190,95%,55%,0.2)]',
          className
        )}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div
      className={cn(
        'glass-panel',
        paddingSizes[padding],
        variant === 'hover' && 'glass-panel-hover',
        className
      )}
    >
      {children}
    </div>
  );
};

export { GlassCard };
