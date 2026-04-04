import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Code, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Watermelon UI – Steps / Timeline Block (3-step horizontal) ─── */

const steps = [
  {
    icon: Layers,
    step: '01',
    title: 'Design Visually',
    description: 'Drag AWS resources onto the canvas. Connect them to define relationships.',
  },
  {
    icon: Code,
    step: '02',
    title: 'Generate Code',
    description: 'Watch Terraform code generate automatically as you build your architecture.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Deploy',
    description: 'Export or deploy directly. Your infrastructure is production-ready.',
  },
];

/* Watermelon: animated connector line between steps */
const StepConnector: React.FC = () => (
  <div className="hidden md:flex items-center flex-1 px-3" aria-hidden="true">
    <div className="relative w-full h-px">
      {/* Static base */}
      <div className="absolute inset-0 bg-gradient-to-r from-glass-border via-primary/20 to-glass-border" />
      {/* Watermelon: animated travelling dot */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(214_100%_58%/0.5)]"
        animate={{ x: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  </div>
);

const HowItWorksSection: React.FC = () => {
  return (
    <section
      className="relative py-32 bg-background-secondary overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Watermelon: subtle top accent line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-20"
        >
          <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to production-ready infrastructure
          </p>
        </motion.div>

        {/* ── Timeline: steps + connectors ── */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-0"
          role="list"
          aria-label="How it works steps"
        >
          {steps.map((step, index) => (
            <React.Fragment key={step.step}>
              {/* ── Watermelon Step Card ── */}
              <motion.div
                role="listitem"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: index * 0.18 }}
                className="relative flex-1 flex flex-col items-center text-center group px-4 py-8 md:py-0"
              >
                {/* Vertical mobile connector */}
                {index < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-primary/30 to-transparent"
                  />
                )}

                {/* Watermelon: icon block with glow + scale on hover */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.25 }}
                  className="relative mb-7"
                  aria-hidden="true"
                >
                  {/* Glow behind icon */}
                  <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-25 rounded-full group-hover:opacity-50 transition-opacity duration-300" />

                  {/* Icon container */}
                  <div className={cn(
                    'relative w-28 h-28 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br from-glass to-glass-highlight',
                    'border border-glass-border',
                    'group-hover:border-primary/40 group-hover:shadow-[0_8px_28px_-8px_hsl(214_100%_58%/0.3)]',
                    'transition-all duration-300'
                  )}>
                    <step.icon
                      className="w-11 h-11 text-primary group-hover:scale-110 transition-transform duration-300"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Watermelon: numbered badge */}
                  <div
                    className={cn(
                      'absolute -top-3 -right-3 w-9 h-9 rounded-full',
                      'bg-gradient-to-br from-primary to-primary-glow',
                      'flex items-center justify-center',
                      'text-primary-foreground font-bold text-xs',
                      'shadow-[0_4px_12px_-2px_hsl(214_100%_58%/0.4)]',
                      'ring-2 ring-background'
                    )}
                    aria-label={`Step ${step.step}`}
                  >
                    {step.step}
                  </div>
                </motion.div>

                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </motion.div>

              {/* Watermelon Divider with animated dot */}
              {index < steps.length - 1 && <StepConnector />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
