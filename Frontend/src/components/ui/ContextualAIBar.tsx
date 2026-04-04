
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Command, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualAIBarProps {
  className?: string;
  placeholder?: string;
  onSubmit?: (query: string) => void;
}

const placeholders = [
  'Deploy a high-availability VPC in us-east-1',
  'Add an S3 bucket with public access blocked',
  'Scale my EC2 instances based on CPU usage',
  'Create a serverless API with Lambda & API Gateway',
];

export const ContextualAIBar: React.FC<ContextualAIBarProps> = ({
  className,
  placeholder: customPlaceholder,
  onSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSubmit) onSubmit(query);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn('relative max-w-2xl mx-auto w-full', className)}
    >
      {/* Outer glow that intensifies on focus */}
      <div
        className={cn(
          'absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 blur-lg transition-opacity duration-500',
          isFocused ? 'opacity-100' : 'opacity-0'
        )}
      />

      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            'relative flex items-center h-14 px-4 rounded-2xl overflow-hidden',
            'bg-glass/40 backdrop-blur-xl border transition-all duration-300',
            isFocused
              ? 'border-primary/50 shadow-[0_0_30px_-8px_hsl(190_95%_55%/0.4)]'
              : 'border-glass-border hover:border-glass-highlight'
          )}
        >
          {/* Icon */}
          <Sparkles
            className={cn(
              'w-5 h-5 mr-3 shrink-0 transition-colors duration-300',
              isFocused ? 'text-primary' : 'text-muted-foreground'
            )}
          />

          {/* Input + floating placeholder */}
          <div className="relative flex-1 h-full flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-transparent"
              aria-label="Describe your cloud infrastructure"
            />

            {/* Animated Placeholder */}
            <AnimatePresence mode="wait">
              {!query && (
                <motion.span
                  key={placeholderIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0.45, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="absolute left-0 text-sm text-muted-foreground pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                >
                  {customPlaceholder || placeholders[placeholderIndex]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Keybind chip */}
          <div className="hidden sm:flex items-center gap-1 ml-3 px-1.5 py-0.5 rounded-md border border-glass-border bg-glass-highlight/20 text-[10px] text-muted-foreground font-mono shrink-0">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>

          {/* Submit button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                type="submit"
                className="ml-3 w-8 h-8 shrink-0 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                aria-label="Submit"
              >
                <ArrowRight className="w-4 h-4 text-primary-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Helper text */}
      <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
        Press <kbd className="font-mono">⌘K</kbd> to open the AI command palette
      </p>
    </motion.div>
  );
};
