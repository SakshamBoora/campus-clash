"use client";
import { motion } from "framer-motion";
import { TrendingUp, Zap, ArrowRight, Clock } from "lucide-react";
import { useModal } from "@/components/ModalContext";

interface BattleCardProps {
    prediction: any;
    isLoggedIn: boolean;
}

export function BattleCard({ prediction, isLoggedIn }: BattleCardProps) {
    const stake = prediction.stakeAmount || 100;
    const { openAuthModal, openBetModal } = useModal();

    // --- 1. POOL & SENTIMENT CALCULATION ---
    const poolA = prediction.poolA || 0;
    const poolB = prediction.poolB || 0;
    const totalPool = poolA + poolB;

    // Calculate Percentages
    const percentA = totalPool === 0 ? 50 : Math.round((poolA / totalPool) * 100);
    const percentB = totalPool === 0 ? 50 : Math.round((poolB / totalPool) * 100);
    // -------------------------------

    // --- 2. DEADLINE LOGIC ---
    const isExpired = prediction.deadline && new Date(prediction.deadline) < new Date();
    const deadlineText = prediction.deadline
        ? new Date(prediction.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : "Open Indefinitely";

    const handleBet = (option: "A" | "B") => {
        if (!isLoggedIn) {
            openAuthModal("Please sign in to place a bet.");
            return;
        }
        openBetModal({
            predictionId: prediction.id,
            option,
            title: prediction.title,
            optionLabel: option === 'A' ? prediction.optionA : prediction.optionB,
            stake
        });
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={`card-glass group relative flex flex-col h-[380px] rounded-3xl overflow-hidden transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-white/80 dark:bg-[#0a0a0a]/80 border-zinc-200 dark:border-white/10 ${isExpired ? 'opacity-75 grayscale' : ''}`}
        >
            {/* Top Banner */}
            <div className="h-24 bg-gradient-to-b from-emerald-500/10 to-transparent dark:from-emerald-900/20 p-6 relative z-10">
                <div className="flex justify-between items-start">
                    <span className={`flex items-center gap-1.5 border text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isExpired
                        ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        }`}>
                        {isExpired ? <Clock className="w-3 h-3" /> : <Zap className="w-3 h-3 fill-current" />}
                        {isExpired ? "Ended" : "Live"}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-500 text-[10px] font-mono border border-zinc-200 dark:border-white/5 px-2 py-1 rounded bg-white/50 dark:bg-black/40 backdrop-blur-sm">
                        {stake} Credits
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 flex flex-col justify-center relative z-10 -mt-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2 mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-100 transition-colors">
                    {prediction.title}
                </h3>

                {/* Sentiment & Pool Display */}
                <div className="flex gap-4 mb-4">
                    {/* YES Option */}
                    <div className="flex-1 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex flex-col items-center justify-center text-center relative">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                            YES
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mb-1">
                            ₹{poolA.toLocaleString()} staked
                        </span>
                        <span className="text-2xl font-mono font-bold text-emerald-500 dark:text-emerald-400">
                            {percentA}%
                        </span>
                        <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono mt-1">
                            support
                        </span>
                    </div>

                    {/* NO Option */}
                    <div className="flex-1 bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex flex-col items-center justify-center text-center relative">
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                            NO
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mb-1">
                            ₹{poolB.toLocaleString()} staked
                        </span>
                        <span className="text-2xl font-mono font-bold text-rose-500 dark:text-rose-400">
                            {percentB}%
                        </span>
                        <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-mono mt-1">
                            support
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 bg-zinc-50 dark:bg-white/5 border-t border-zinc-100 dark:border-white/5 grid grid-cols-2 gap-3 relative z-10">
                <button
                    onClick={() => handleBet('A')}
                    disabled={isExpired}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white dark:text-black font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 uppercase tracking-wide text-xs flex items-center justify-center gap-2"
                >
                    {prediction.optionA} <ArrowRight size={14} />
                </button>
                <button
                    onClick={() => handleBet('B')}
                    disabled={isExpired}
                    className="bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 border border-zinc-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/50 font-bold py-3 rounded-xl transition-all uppercase tracking-wide text-xs"
                >
                    {prediction.optionB}
                </button>
            </div>
        </motion.div>
    );
}