import React from 'react';
import { motion } from 'framer-motion';

const techStack = [
  { name: 'React', color: '#61DAFB' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Terraform', color: '#7B42BC' },
  { name: 'AWS', color: '#FF9900' },
  { name: 'Tailwind', color: '#06B6D4' },
  { name: 'Vite', color: '#646CFF' },
];

const TechStackSection: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden border-y border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Built with Modern Technologies
          </p>
        </motion.div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div 
                className="w-3 h-3 rounded-full transition-shadow group-hover:shadow-lg"
                style={{ 
                  backgroundColor: tech.color,
                  boxShadow: `0 0 20px ${tech.color}40`
                }}
              />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
