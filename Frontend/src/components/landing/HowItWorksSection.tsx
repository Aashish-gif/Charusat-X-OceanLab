import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Code, Rocket } from 'lucide-react';

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

const HowItWorksSection: React.FC = () => {
  return (
    <section className="relative py-32 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to production-ready infrastructure
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-gradient-to-r from-glass-border via-primary/30 to-glass-border" />
              )}
              
              <div className="relative text-center">
                {/* Step Number */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative inline-block mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-30" />
                  <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-glass to-glass-highlight border border-glass-border flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {step.step}
                  </div>
                </motion.div>
                
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
