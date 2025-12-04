"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, AlertCircle } from "lucide-react";
import SwipeButton from "./SwipeButton";
import { useRouter } from "next/navigation";

import { placeBet } from "@/app/actions";
import { toast } from "sonner";

interface BettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    predictionId: string;
    option: "A" | "B";
    title: string;
    optionLabel: string;
}

export default function BettingModal({ isOpen, onClose, predictionId, option, title, optionLabel, stake = 100 }: BettingModalProps & { stake?: number }) {
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const router = useRouter();

    const totalCost = quantity * stake;

    const handleConfirm = async () => {
        try {
            const result = await placeBet(predictionId, option === 'A' ? "OPTION_A" : "OPTION_B", quantity);
            if (result.success) {
                toast.success(result.message);
                window.dispatchEvent(new Event("auth-change"));
                router.refresh();
                onClose();
                return true;
            } else {
                setError(result.message || "Failed to place bet");
                toast.error(result.message || "Failed to place bet");
                return false;
            }
        } catch (err) {
            setError("An unexpected error occurred");
            toast.error("An unexpected error occurred");
            return false;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-2">Place Your Bet</h2>
                            <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{title}</p>

                            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Option</span>
                                    <span className={`font-bold ${option === 'A' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {optionLabel}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Price per Bet</span>
                                    <span className="font-mono text-white font-bold">{stake} Credits</span>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Quantity</span>
                                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="font-mono text-white font-bold w-8 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Total Cost</span>
                                    <span className="font-mono text-emerald-400 font-bold text-lg">{totalCost} Credits</span>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-red-500/10 text-red-400 mb-4">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <SwipeButton
                                onConfirm={handleConfirm}
                                label={`Swipe to Bet ${totalCost} Credits`}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
