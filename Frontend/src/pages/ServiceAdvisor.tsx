import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lightbulb, Compass, Loader2, DollarSign, Activity, CheckCircle2, Zap } from 'lucide-react';
import { recommendationApi, ServiceSuggestion } from '@/lib/api';
import { motion } from 'framer-motion';

const ServiceAdvisor = () => {
    const [workloadType, setWorkloadType] = useState('Web Application');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<ServiceSuggestion | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGetAdvice = async () => {
        if (!budget) {
            setError('Please enter a budget');
            return;
        }

        setLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            const result = await recommendationApi.getSuggestion({ workloadType, budget });
            if (result.success) {
                setSuggestion(result.data);
            } else {
                setError('Failed to get recommendation');
            }
        } catch (err: any) {
            console.error("Advisor error:", err);
            setError(err.message || 'Error occurred while fetching advice');
        } finally {
            setLoading(false);
        }
    };

    const workloadOptions = [
        'Web Application',
        'Mobile Backend',
        'Data Analytics',
        'File Storage',
        'Machine Learning'
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                        <Compass className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Service <span className="gradient-text">Advisor</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Not sure which AWS service to pick? Tell us what you're building and your budget, and we'll guide you.
                    </p>
                </header>

                <div className="grid gap-8">
                    <GlassCard className="p-8">
                        <div className="grid md:grid-cols-2 gap-6 items-end">
                            <div className="space-y-2">
                                <Label>Workload Type</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={workloadType}
                                    onChange={(e) => setWorkloadType(e.target.value)}
                                >
                                    {workloadOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Monthly Budget ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="e.g. 50"
                                        className="pl-9"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity h-12 text-lg"
                                    onClick={handleGetAdvice}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lightbulb className="w-5 h-5 mr-2" />}
                                    Get Recommendation
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                    </GlassCard>

                    {suggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <GlassCard className="p-8 border-primary/30 bg-primary/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                                <div className="relative z-10">
                                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Recommended Service</h3>
                                    <h2 className="text-3xl font-bold mb-6">{suggestion.service}</h2>

                                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                                        <div className="p-4 rounded-lg bg-background/40 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                                <DollarSign className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase">Est. Cost</span>
                                            </div>
                                            <p className="font-semibold">{suggestion.estimatedCost}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-background/40 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                                <Activity className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase">Complexity</span>
                                            </div>
                                            <p className="font-semibold">{suggestion.complexity}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-background/40 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase">Fit</span>
                                            </div>
                                            <p className="font-semibold">Best Match</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert max-w-none space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Why this service?</h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {suggestion.reason}
                                            </p>
                                        </div>

                                        {suggestion.tips && (
                                            <div className="mt-4 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                                                <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-1">
                                                    <Zap className="w-4 h-4" />
                                                    Architect's Pro-Tip
                                                </h4>
                                                <p className="text-sm italic text-muted-foreground">
                                                    "{suggestion.tips}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ServiceAdvisor;
