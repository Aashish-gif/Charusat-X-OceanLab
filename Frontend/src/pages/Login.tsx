import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success) {
        setAuth(response.token, response.user);
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const irisColor = showPassword ? '#10b981' : 'hsl(var(--muted-foreground))';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4 sm:px-6"
      >
        <div className="glass-panel p-8 rounded-2xl border border-glass-border">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4"
            >
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-glass border-glass-border"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-glass border-glass-border"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    initial={false}
                    animate={{ scale: showPassword ? 1.06 : 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <motion.path
                      d="M2 12C4.3 7.5 8 5 12 5s7.7 2.5 10 7c-2.3 4.5-6 7-10 7s-7.7-2.5-10-7Z"
                      fill="none"
                      stroke={irisColor}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <motion.path
                      d="M2 12C4.3 9.2 8 8 12 8s7.7 1.2 10 4"
                      fill="none"
                      stroke={irisColor}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      animate={{ opacity: showPassword ? 0 : 1, y: showPassword ? -1.5 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.path
                      d="M2 12c2.3 2.8 6 4 10 4s7.7-1.2 10-4"
                      fill="none"
                      stroke={irisColor}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      animate={{ opacity: showPassword ? 0 : 1, y: showPassword ? 1.5 : 0 }}
                      transition={{ duration: 0.2 }}
                    />

                    <motion.circle
                      cx="12"
                      cy="12"
                      r="4"
                      fill="none"
                      stroke={irisColor}
                      strokeWidth="1.2"
                      animate={{ scale: showPassword ? 1 : 0.65, opacity: showPassword ? 1 : 0.6 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    />
                    <motion.circle
                      cx="12"
                      cy="12"
                      r="2"
                      fill={showPassword ? '#10b981' : 'hsl(var(--muted-foreground))'}
                      animate={{ scale: showPassword ? 1 : 0.4 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.svg>
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <GradientButton
              type="submit"
              size="lg"
              className="w-full"
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </GradientButton>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
