import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cloud, Menu, X, User, Settings, PieChart, Lightbulb } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-glass-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-1 bg-gradient-primary rounded-xl">
                <img src="/logo.png" alt="Zenith Ai Logo" className="w-7 h-7 object-contain" />
              </div>
            </motion.div>
            <span className="font-bold text-lg">
              Zenith Ai
            </span>
          </Link>

          {/* New Section: Budget Analysis */}
          <div className="hidden md:flex items-center ml-8">
            <Link to="/budget-analysis">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <PieChart className="w-4 h-4" />
                Budget Analysis
              </button>
            </Link>
          </div>

          {/* New Section: Service Advisor */}
          <div className="hidden md:flex items-center ml-4">
            <Link to="/service-advisor">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Lightbulb className="w-4 h-4" />
                Service Advisor
              </button>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex justify-end">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all">
                  <Settings className="w-5 h-5" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center outline-none cursor-pointer transition-transform active:scale-95">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-white/10">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email || 'user@example.com'}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={() => clearAuth()} className="text-red-500 focus:text-red-500 cursor-pointer focus:bg-red-500/10">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <GradientButton variant="ghost" size="sm">
                    Sign In
                  </GradientButton>
                </Link>
                <Link to="/signup">
                  <GradientButton size="sm">
                    Get Started
                  </GradientButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-background/95 backdrop-blur-xl border-b border-glass-border"
        >
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Section: Budget Analysis */}
            <Link to="/budget-analysis" onClick={() => setIsOpen(false)}>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-glass/50 transition-all">
                <PieChart className="w-5 h-5" />
                Budget Analysis
              </button>
            </Link>

            {/* Mobile Section: Service Advisor */}
            <Link to="/service-advisor" onClick={() => setIsOpen(false)}>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-glass/50 transition-all">
                <Lightbulb className="w-5 h-5" />
                Service Advisor
              </button>
            </Link>

            {isAuthenticated ? (
              <>
                <div className="border-t border-white/10 pt-4 mt-2">
                  <div className="flex items-center gap-3 px-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{user?.username || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
                    </div>
                  </div>

                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-glass/50 transition-all">
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      clearAuth();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                  <GradientButton variant="ghost" size="sm" className="w-full">
                    Sign In
                  </GradientButton>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="block">
                  <GradientButton size="sm" className="w-full">
                    Get Started
                  </GradientButton>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;