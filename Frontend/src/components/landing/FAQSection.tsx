import React from 'react';
import { motion } from 'framer-motion';
import {
  MousePointer2, Code2, RefreshCw, Shield, Zap, Cloud,
  Globe, Lock, Cpu
} from 'lucide-react';
import { IntegrationTile } from '../ui/IntegrationTile';
import { DeploymentCard } from '../ui/DeploymentCard';
import { cn } from '@/lib/utils';

/* ─── Watermelon UI – Feature Card component ─── */

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

const WatermelonFeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon, title, description, gradient, delay = 0
}) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -6 }}
    className={cn(
      // Watermelon Feature Card base
      'relative flex flex-col gap-4 p-6 h-full overflow-hidden',
      'rounded-2xl border border-glass-border bg-glass/15 backdrop-blur-sm',
      'transition-all duration-300 group cursor-default',
      'hover:border-glass-highlight hover:bg-glass/25',
      // Watermelon glow on hover
      'hover:shadow-[0_16px_40px_-12px_hsl(214_100%_58%/0.18)]'
    )}
    aria-label={title}
  >
    {/* Watermelon subtle inner corner gradient */}
    <div
      aria-hidden="true"
      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    />

    {/* Icon with Watermelon gradient border + colour transition */}
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ duration: 0.25 }}
      className={cn(
        `w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-px`,
        'shadow-[0_4px_16px_-4px_hsl(214_100%_58%/0.3)]',
        'group-hover:shadow-[0_6px_20px_-4px_hsl(214_100%_58%/0.5)] transition-shadow duration-300'
      )}
      aria-hidden="true"
    >
      <div className="w-full h-full rounded-[11px] bg-background/80 flex items-center justify-center">
        <Icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
      </div>
    </motion.div>

    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
  </motion.article>
);

const features: FeatureCardProps[] = [
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
    gradient: 'from-primary to-primary-glow',
  },
  {
    icon: RefreshCw,
    title: 'Live Sync',
    description: 'Bi-directional sync between visual design and code. Edit either, both update.',
    gradient: 'from-primary to-primary-glow',
  },
  {
    icon: Shield,
    title: 'Security Warnings',
    description: 'Built-in security analysis detects misconfigurations before deployment.',
    gradient: 'from-primary to-primary-glow',
  },
  {
    icon: Zap,
    title: 'Instant Deployment',
    description: 'One-click deployment to AWS with automated state management.',
    gradient: 'from-primary to-primary-glow',
  },
  {
    icon: Cloud,
    title: 'Multi-Cloud Support',
    description: 'AWS today, GCP and Azure coming soon. One tool for all clouds.',
    gradient: 'from-primary to-primary-glow',
  },
];

/* ─── Watermelon UI – FeaturesSection ─── */

const FeaturesSection: React.FC = () => {
  return (
    <section
      className="relative py-32 overflow-hidden bg-background-secondary/30"
      aria-labelledby="features-heading"
    >
      {/* Watermelon: subtle vertical rule accents */}
      <div aria-hidden="true" className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-glass-border to-transparent opacity-20" />
      <div aria-hidden="true" className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-glass-border to-transparent opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-20"
        >
          <h2 id="features-heading" className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
            Everything You Need to
            <span className="gradient-text"> Ship Faster</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            From visual design to production-ready infrastructure in minutes, not days.
          </p>
        </motion.div>

        {/* ── Watermelon: 6-card responsive grid ── */}
        <div
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16"
        >
          {features.map((feat, i) => (
            <div role="listitem" key={feat.title}>
              <WatermelonFeatureCard {...feat} delay={i * 0.08} />
            </div>
          ))}
        </div>

        {/* ── Watermelon: Bento feature spotlight ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[580px]">

          {/* Large bento card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 md:row-span-2 bento-card group"
            aria-label="Interactive Canvas feature highlight"
          >
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <MousePointer2 className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold">Interactive Canvas</h3>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                A world-class drag-and-drop experience. Logic-aware connections ensure your
                VPCs, Subnets, and Gateways are always correctly routed.
              </p>
            </div>
            <div className="mt-8 transform -rotate-3 translate-x-4 opacity-90 group-hover:rotate-0 group-hover:translate-x-0 transition-all duration-500">
              <DeploymentCard progress={92} projectName="VPC-Production-Main" />
            </div>
          </motion.div>

          {/* Medium bento: Terraform Native */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 bento-card flex-row gap-6 items-center"
            aria-label="Terraform Native feature"
          >
            <div className="flex-1 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Code2 className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold">Terraform Native</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Every visual block maps directly to production-grade HCL. No proprietary formats,
                just pure infrastructure as code.
              </p>
            </div>
            <div
              className="hidden sm:block w-40 glass-panel p-3 font-mono text-[8px] bg-black/40 border-glass-border"
              aria-label="Terraform code sample"
              role="img"
            >
              <span className="text-primary">resource</span> "aws_instance" "web" {'{'}
              <br />&nbsp;&nbsp;ami = "ami-0c55b1"
              <br />&nbsp;&nbsp;type = "t3.medium"
              <br />{'}'}
            </div>
          </motion.div>

          {/* Small bento tiles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="md:col-span-1"
          >
            <IntegrationTile
              icon={<Globe className="w-5 h-5 text-primary" aria-hidden="true" />}
              label="Edge Config"
              description="Global distribution"
              className="h-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="md:col-span-1"
          >
            <IntegrationTile
              icon={<Lock className="w-5 h-5 text-primary" aria-hidden="true" />}
              label="IAM Guard"
              description="Policy enforcement"
              active={true}
              className="h-full"
            />
          </motion.div>
        </div>

        {/* ── Watermelon Feature Pills ── */}
        <div
          className="mt-14 flex flex-wrap justify-center gap-3"
          role="list"
          aria-label="Key platform capabilities"
        >
          {[
            { Icon: Zap, text: 'Instant Sync' },
            { Icon: Shield, text: 'SOC2 Ready' },
            { Icon: Cloud, text: 'Multi-Cloud' },
            { Icon: Cpu, text: 'AI Optimized' },
          ].map(({ Icon, text }, i) => (
            <motion.div
              role="listitem"
              key={text}
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full',
                'glass-panel border-glass-border',
                'hover:border-primary/50 hover:bg-glass/30',
                'transition-all duration-200 cursor-default'
              )}
            >
              <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">{text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
