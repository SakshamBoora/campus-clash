"use client";

import { useState, useMemo } from "react";
import { BattleCard } from "@/components/BattleCard";
import { ArrowUpDown, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PredictionGridProps {
    predictions: any[];
    isLoggedIn: boolean;
}

type SortOption = "newest" | "oldest" | "best_odds" | "worst_odds";

export function PredictionGrid({ predictions, isLoggedIn }: PredictionGridProps) {
    const [sortOption, setSortOption] = useState<SortOption>("newest");

    const getMaxMultiplier = (prediction: any) => {
        const poolA = prediction.poolA || 0;
        const poolB = prediction.poolB || 0;
        const totalPool = poolA + poolB;

        if (poolA === 0 && poolB === 0) return 1.0;

        const oddsA = poolA > 0 ? totalPool / poolA : 1.0;
        const oddsB = poolB > 0 ? totalPool / poolB : 1.0;

        return Math.max(oddsA, oddsB);
    };

    const sortedPredictions = useMemo(() => {
        const sorted = [...predictions];

        switch (sortOption) {
            case "newest":
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case "oldest":
                sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case "best_odds":
                sorted.sort((a, b) => getMaxMultiplier(b) - getMaxMultiplier(a));
                break;
            case "worst_odds":
                sorted.sort((a, b) => getMaxMultiplier(a) - getMaxMultiplier(b));
                break;
        }

        return sorted;
    }, [predictions, sortOption]);

    return (
        <div className="space-y-6">
            {/* Sorting Controls */}
            <div className="flex justify-end">
                <div className="relative inline-block text-left">
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="appearance-none bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="best_odds">Best Odds First</option>
                        <option value="worst_odds">Worst Odds First</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                        <ArrowUpDown size={14} />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {sortedPredictions.map((bet) => (
                        <motion.div
                            key={bet.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <BattleCard
                                prediction={bet}
                                isLoggedIn={isLoggedIn}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {sortedPredictions.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl bg-zinc-50 dark:bg-white/5">
                        <p className="text-zinc-500 font-mono">No active markets found. Be the first to create one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
