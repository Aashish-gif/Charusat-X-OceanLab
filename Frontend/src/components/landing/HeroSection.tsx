import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-bg" />

      {/* Floating Gradient Orbs */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-glass/60 border border-glass-border backdrop-blur-sm"
        >
          <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain" />
          <span className="text-sm text-muted-foreground">
            Visual Infrastructure Design
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          Design Cloud Infrastructure
          <br />
          <span className="gradient-text">Visually</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Drag AWS resources to design your architecture.
          Terraform code writes itself. Ship infrastructure faster.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login">
            <GradientButton size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
              Get Started
            </GradientButton>
          </Link>
          <GradientButton variant="secondary" size="lg" icon={<Play className="w-5 h-5" />}>
            Watch Demo
          </GradientButton>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-16 relative"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-glow opacity-60" />

          {/* Mock Editor Preview */}
          <div className="relative glass-panel p-2 mx-auto max-w-4xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <span className="text-xs text-muted-foreground ml-4">zenith-ai-studio</span>
            </div>

            <div className="grid grid-cols-12 h-80">
              {/* Sidebar Mock */}
              <div className="col-span-2 border-r border-glass-border p-3">
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="h-8 rounded-lg bg-glass-highlight/50"
                    />
                  ))}
                </div>
              </div>

              {/* Canvas Mock */}
              <div className="col-span-6 relative grid-pattern p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="absolute top-8 left-8 w-24 h-16 rounded-xl bg-gradient-primary/20 border border-primary/30 flex items-center justify-center"
                >
                  <span className="text-xs text-primary">VPC</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  className="absolute top-20 right-12 w-24 h-16 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center"
                >
                  <span className="text-xs text-accent">Lambda</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 }}
                  className="absolute bottom-12 left-1/3 w-24 h-16 rounded-xl bg-success/20 border border-success/30 flex items-center justify-center"
                >
                  <span className="text-xs text-success">S3</span>
                </motion.div>
              </div>

              {/* Code Mock */}
              <div className="col-span-4 border-l border-glass-border p-3 font-mono text-xs text-left">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="space-y-1 text-muted-foreground"
                >
                  <p><span className="text-primary">resource</span> "aws_vpc" "main" {'{'}</p>
                  <p className="pl-4">cidr_block = "10.0.0.0/16"</p>
                  <p>{'}'}</p>
                  <p className="mt-2"><span className="text-accent">resource</span> "aws_lambda" {'{'}</p>
                  <p className="pl-4">function_name = "api"</p>
                  <p>{'}'}</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
