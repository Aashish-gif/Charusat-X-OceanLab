
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, Terminal, Cpu, Cloud, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeploymentCardProps {
  className?: string;
  status?: 'idle' | 'running' | 'success' | 'failed';
  projectName?: string;
  progress?: number;
}

const steps = [
  { label: 'VPC Infrastructure Provisioned', done: true },
  { label: 'Security Groups Applied', done: true },
  { label: 'Initializing EC2 Instances…', done: false },
];

export const DeploymentCard: React.FC<DeploymentCardProps> = ({
  className,
  status = 'running',
  projectName = 'Zenith v2.1.0',
  progress = 65,
}) => {
  const statusColors: Record<string, string> = {
    running: 'bg-primary/20 text-primary',
    success: 'bg-success/20 text-success',
    failed: 'bg-destructive/20 text-destructive',
    idle: 'bg-muted/20 text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={cn(
        'relative rounded-2xl border border-glass-border bg-glass/30 backdrop-blur-xl p-5 flex flex-col gap-4 w-full max-w-[300px] shadow-glass',
        className
      )}
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground truncate max-w-[160px]">
            {projectName}
          </span>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider',
            statusColors[status],
            status === 'running' && 'animate-pulse'
          )}
        >
          {status}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Resources Provisioning</span>
          <span className="font-mono text-primary font-bold">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-glass-highlight/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary-glow"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            {step.done ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
            ) : (
              <CircleDashed className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            )}
            <span className={step.done ? 'text-foreground/80' : 'text-muted-foreground'}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-glass-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-40">
          <Cpu className="w-3 h-3" />
          <Database className="w-3 h-3" />
          <Cloud className="w-3 h-3" />
        </div>
        <span className="text-[9px] text-muted-foreground/60 italic">IaC Engine v2</span>
      </div>
    </motion.div>
  );
};
