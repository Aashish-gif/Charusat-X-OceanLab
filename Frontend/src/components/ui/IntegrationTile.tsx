
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationTileProps {
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  description?: string;
  active?: boolean;
}

export const IntegrationTile: React.FC<IntegrationTileProps> = ({
  className,
  icon = <Zap className="w-5 h-5 text-primary" />,
  label = 'AWS Lambda',
  description = 'Serverless execution',
  active = true,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex flex-col justify-between h-full p-5 rounded-2xl overflow-hidden',
        'bg-glass/20 backdrop-blur-xl border border-glass-border',
        'hover:border-primary/40 hover:bg-glass/30 transition-colors duration-300 cursor-default group',
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-glass-highlight/50 border border-glass-border shrink-0">
          {icon}
        </div>
        {active && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/20 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {label}
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>

      {/* Hover underline */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500 ease-out" />
    </motion.div>
  );
};
