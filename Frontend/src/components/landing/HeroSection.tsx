import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContextualAIBar } from '../ui/ContextualAIBar';
import { DeploymentCard } from '../ui/DeploymentCard';
import { cn } from '@/lib/utils';

/* ── Shine on gradient text ── */
const ShineText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={cn('relative inline-block', className)}>
    {children}
    <motion.span
      className="absolute inset-0 bg-white/15 blur-sm"
      animate={{ opacity: [0, 0.7, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
    />
  </span>
);

/* ── Cloud-Drift layer: drifts at a parallax offset relative to scroll ── */
const CloudDriftLayer: React.FC<{
  children: React.ReactNode;
  speed?: number;      // 0 = static, 1 = full scroll
  className?: string;
}> = ({ children, speed = 0.15, className }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);
  return (
    <motion.div style={{ y }} className={cn('absolute inset-0 pointer-events-none', className)}>
      {children}
    </motion.div>
  );
};

const HeroSection: React.FC = () => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
      aria-labelledby="hero-heading"
    >
      {/* ── Layer 0: Deep obsidian base ── */}
      <div aria-hidden="true" className="absolute inset-0 grid-pattern opacity-15" />

      {/* ── Layer 1 (slow drift): large monochrome orb ── */}
      <CloudDriftLayer speed={0.08}>
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -32, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'hsl(214 100% 58% / 0.08)' }}
        />
      </CloudDriftLayer>

      {/* ── Layer 2 (medium drift): secondary orb ── */}
      <CloudDriftLayer speed={0.18}>
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 28, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'hsl(214 100% 58% / 0.08)' }}
        />
      </CloudDriftLayer>

      {/* ── Layer 3 (fastest drift): small accent orb ── */}
      <CloudDriftLayer speed={0.28}>
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -18, 0], x: [0, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-2/3 left-1/3 w-52 h-52 rounded-full blur-3xl"
          style={{ background: 'hsl(214 100% 58% / 0.06)' }}
        />
      </CloudDriftLayer>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full backdrop-blur-sm"
          style={{
            background: 'hsl(214 100% 58% / 0.08)',
            border: '1px solid hsl(214 100% 58% / 0.25)',
            boxShadow: 'inset 0 1px 0 hsl(214 100% 58% / 0.15)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Next-Gen Visual Infrastructure Design
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.06]"
        >
          Build Cloud Systems
          <br />
          <ShineText className="gradient-text">Through Conversation</ShineText>
        </motion.h1>

        {/* Subtitle + AI bar + CTAs */}
        <div className="max-w-2xl mx-auto mb-16 space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
          >
            Describe your stack in plain English. Zenith AI architects your AWS environment
            visually and generates production-ready Terraform instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
          >
            <ContextualAIBar className="mb-6" />

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Primary: Liquid-Fill gradient button */}
              <Link to="/signup" aria-label="Get started with Zenith AI">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="relative flex items-center gap-2 px-8 py-3.5 rounded-xl overflow-hidden font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{
                    background: 'linear-gradient(135deg, hsl(214 100% 58%), hsl(214 100% 68%))',
                    boxShadow: '0 0 32px -6px hsl(214 100% 58% / 0.6)',
                  }}
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)' }}
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '160%' }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                  />
                  <span className="relative">Get Started</span>
                  <ArrowRight className="relative w-4 h-4" aria-hidden="true" />
                </motion.button>
              </Link>

              {/* Secondary */}
              <motion.a
                href="https://drive.google.com/file/d/1hAy1jLsVis7HAkPuOVh5rI5BdAOIGBD2/view"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{
                  background: 'hsl(214 100% 58% / 0.07)',
                  border: '1px solid hsl(214 100% 58% / 0.20)',
                }}
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                Watch Demo
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
          className="relative flex flex-col lg:flex-row items-center justify-center gap-8 min-h-[380px]"
          aria-label="Visual preview"
        >
          <div className="relative z-20 group">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
              style={{ background: 'hsl(214 100% 58% / 0.12)' }}
            />
            <DeploymentCard status="running" progress={78} projectName="Zenith Production" />
          </div>

          <div className="flex flex-col gap-4 lg:mt-10" aria-label="Live infrastructure stats">
            {/* Cost tile */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-panel p-4 flex flex-col gap-3 w-52"
              aria-label="Live cost estimation: $142.50 per month"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Live Costing</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground" aria-live="polite">$142.50</span>
                <span className="text-[10px] text-muted-foreground">/mo</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'hsl(214 100% 58% / 0.10)' }}>
                <div className="h-full w-3/4" style={{ background: 'hsl(214 100% 58%)' }} />
              </div>
            </motion.div>

            {/* Quick action tile */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="glass-panel p-4 flex items-center gap-3 w-52 cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label="Quick action: Sync Terraform"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 12 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'hsl(214 100% 58% / 0.15)' }}
                aria-hidden="true"
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Quick Action</span>
                <span className="text-[9px] text-muted-foreground uppercase">Sync Terraform</span>
              </div>
            </motion.div>
          </div>

          <div
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(214 100% 58% / 0.15), transparent)' }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
