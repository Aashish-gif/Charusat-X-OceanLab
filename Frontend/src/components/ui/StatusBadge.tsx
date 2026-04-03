import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  variant = 'default', 
  size = 'sm', 
  className, 
  children,
}) => {
  const variants = {
    default: 'bg-primary/20 text-primary border-primary/30',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    danger: 'bg-destructive/20 text-destructive border-destructive/30',
    outline: 'bg-transparent text-muted-foreground border-glass-border',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export { StatusBadge };
