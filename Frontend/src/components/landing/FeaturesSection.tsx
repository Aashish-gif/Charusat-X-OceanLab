import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Code2, RefreshCw, Shield, Zap, Cloud } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const features = [
  {
    icon: MousePointer2,
    title: 'Drag & Drop Design',
    description: 'Intuitive visual interface to design complex cloud architectures without writing code.',
    gradient: 'from-primary to-primary-glow',
  },
  {
    icon: Code2,
    title: 'Auto-Generated Terraform',
    description: 'Real-time Terraform code generation that stays perfectly in sync with your diagram.',
    gradient: 'from-accent to-accent-glow',
  },
  {
    icon: RefreshCw,
    title: 'Live Sync',
    description: 'Bi-directional sync between visual design and code. Edit either, both update.',
    gradient: 'from-success to-emerald-400',
  },
  {
    icon: Shield,
    title: 'Security Warnings',
    description: 'Built-in security analysis detects misconfigurations before deployment.',
    gradient: 'from-warning to-amber-400',
  },
  {
    icon: Zap,
    title: 'Instant Deployment',
    description: 'One-click deployment to AWS with automated state management.',
    gradient: 'from-primary to-accent',
  },
  {
    icon: Cloud,
    title: 'Multi-Cloud Support',
    description: 'AWS today, GCP and Azure coming soon. One tool for all clouds.',
    gradient: 'from-accent to-primary',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Ship Faster</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From visual design to production-ready infrastructure in minutes, not days.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard variant="interactive" className="h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-4`}>
                  <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
