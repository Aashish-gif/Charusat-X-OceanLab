import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Wallet, HardDrive, CheckCircle2, AlertCircle, Server, Database, Cloud, Zap, Loader2 } from 'lucide-react';
import { pricingApi, PricingRecommendation } from '@/lib/api';

const BudgetAnalysis = () => {
  const [budget, setBudget] = useState<string>("100");
  const [storage, setStorage] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PricingRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await pricingApi.calculateBudget({ budget, storage });
        if (result.success) {
          setData(result.data);
        } else {
          setError('Failed to calculate budget');
        }
      } catch (err: any) {
        console.error("Error fetching budget data:", err);
        setError(err.message || "Failed to load recommendations. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [budget, storage]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PieChart className="w-8 h-8 text-primary" />
            Zenith Ai <span className="gradient-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter your constraints to receive an optimized AWS service stack suggestion.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <GlassCard className="p-6 h-fit space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Constraints
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget ($)</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="budget"
                    type="number"
                    className="pl-10"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Required Storage (GB)</Label>
                <div className="relative">
                  <HardDrive className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="storage"
                    type="number"
                    className="pl-10"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {data && (
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Est. Total Monthly</span>
                  <span className="text-xl font-bold text-primary">${data.totalEst}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(data.utilization), 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center uppercase tracking-wider">
                  {data.utilization}% of your budget utilized
                </p>
              </div>
            )}

            {loading && (
              <div className="flex justify-center pt-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </GlassCard>

          {/* Output Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Recommended Service Stack</h2>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {!loading && data ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RecommendationItem
                    icon={<Server className="w-5 h-5 text-blue-400" />}
                    title="Compute Suggestion"
                    value={data.compute.name}
                    desc={data.compute.desc}
                    price={data.compute.price}
                  />
                  <RecommendationItem
                    icon={<Database className="w-5 h-5 text-orange-400" />}
                    title="Database Suggestion"
                    value={data.db.name}
                    desc={data.db.desc}
                    price={data.db.price}
                  />
                  <RecommendationItem
                    icon={<Cloud className="w-5 h-5 text-cyan-400" />}
                    title="Storage Suggestion"
                    value={`S3 Standard (${storage} GB)`}
                    desc={`Highly durable object storage. Costs approx. $${data.storageCost}/mo.`}
                    price={parseFloat(data.storageCost)}
                  />
                  <RecommendationItem
                    icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    title="AI Optimized Stack"
                    value="Standard Web Stack"
                    desc="This combination provides the best price-to-performance ratio for your constraints."
                    price={0}
                  />
                </div>

                <GlassCard className="p-6 border-dashed border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-primary mt-1 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-primary">Architect's Guidance</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        With a <strong>${budget}</strong> budget, utilizing <strong>{data.compute.name}</strong> and <strong>{data.db.name}</strong> ensures you maintain performance while staying cost-effective. Consider using <strong>Reserved Instances</strong> if your workload is stable to save up to 40% on compute.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </>
            ) : !loading && !error && (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <PieChart className="w-12 h-12 mb-4 opacity-20" />
                <p>Enter your budget constraints to generate a recommendation.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const RecommendationItem = ({ icon, title, value, desc, price }: { icon: React.ReactNode, title: string, value: string, desc: string, price: number }) => (
  <GlassCard className="p-5 flex flex-col justify-between border-white/5 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      {icon}
    </div>
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
      </div>
      <p className="text-lg font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
    {price > 0 && (
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
        <span className="text-muted-foreground">Estimated Monthly</span>
        <span className="font-mono text-primary font-bold">${price.toFixed(2)}</span>
      </div>
    )}
  </GlassCard>
);

export default BudgetAnalysis;