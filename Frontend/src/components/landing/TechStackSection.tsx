import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ─── Monochrome UI – Logo Grid / Marquee (tech stack) ─── */

const techStack = [
  'React',
  'TypeScript',
  'Terraform',
  'AWS',
  'Tailwind',
  'Vite',
  'Framer Motion',
  'Zustand',
];

const TechStackSection: React.FC = () => {
  return (
    <section
      className="relative py-24 overflow-hidden border-y border-glass-border bg-glass/5"
      aria-labelledby="tech-stack-heading"
    >
      {/* Subtle top + bottom accent lines */}
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span
            id="tech-stack-heading"
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-3 block"
          >
            Built With Modern Technologies
          </span>
          <h3 className="text-2xl font-semibold text-foreground/70">
            Battle-tested stack, zero lock-in
          </h3>
        </motion.div>

        {/* Glass Card wrapping the marquee */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            'relative rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-xl',
            'py-8 overflow-hidden',
            'shadow-[0_4px_32px_-12px_hsl(214_100%_58%/0.12)]'
          )}
          aria-label="Technology stack marquee"
        >
          {/* Infinite marquee – two copies for seamless loop */}
          <div
            className="relative flex overflow-hidden select-none"
            aria-hidden="true"
          >
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="flex gap-12 whitespace-nowrap"
            >
              {[...techStack, ...techStack].map((tech, i) => (
                <div
                  key={`${tech}-${i}`}
                  className="flex items-center gap-3 group cursor-default"
                >
                  {/* Colour dot with glow + scale-on-hover */}
                  <motion.div
                    whileHover={{ scale: 1.6 }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: 'hsl(var(--primary))',
                      boxShadow: '0 0 10px 2px hsl(var(--primary) / 0.55)',
                    }}
                  />
                  <span className="text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    {tech}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          </div>

          {/* Accessible fallback list for screen-readers */}
          <ul className="sr-only">
            {techStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;
