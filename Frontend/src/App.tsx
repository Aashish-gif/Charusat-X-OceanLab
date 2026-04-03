import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import BudgetAnalysis from "./pages/BudgetAnalysis";
import ServiceAdvisor from "./pages/ServiceAdvisor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(220 18% 9%)',
            border: '1px solid hsl(220 15% 18%)',
            color: 'hsl(210 40% 98%)',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio/:projectId" element={<Studio />} />

          {/* Section: Budget Analysis Route */}
          <Route path="/budget-analysis" element={<BudgetAnalysis />} />
          <Route path="/service-advisor" element={<ServiceAdvisor />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;