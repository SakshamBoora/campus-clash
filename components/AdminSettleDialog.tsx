"use client";

import { useState } from "react";
import { settlePrediction } from "@/app/actions";
import { Gavel, Calendar, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminSettleDialogProps {
    prediction: {
        id: string;
        title: string;
        optionA: string;
        optionB: string;
    };
}

export default function AdminSettleDialog({ prediction }: AdminSettleDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [winner, setWinner] = useState<"OPTION_A" | "OPTION_B" | null>(null);
    const [cutoffDate, setCutoffDate] = useState(new Date().toISOString().slice(0, 16)); // Default to now
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSettle = async () => {
        if (!winner) return;
        if (!confirm(`Are you sure ${winner === "OPTION_A" ? prediction.optionA : prediction.optionB} won? This cannot be undone.`)) return;

        setIsProcessing(true);
        const result = await settlePrediction(prediction.id, winner, new Date(cutoffDate));
        setIsProcessing(false);

        if (result.success) {
            alert("Settled successfully!");
            setIsOpen(false);
        } else {
            alert("Error: " + result.message);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded-lg text-xs font-bold hover:bg-purple-500/30 flex items-center gap-1"
            >
                <Gavel size={12} />
                Settle
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-2">Settle Prediction</h2>
                            <p className="text-sm text-gray-400 mb-6">{prediction.title}</p>

                            <div className="space-y-6">
                                {/* Winner Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Who Won?</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setWinner("OPTION_A")}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${winner === "OPTION_A"
                                                    ? "bg-purple-500 text-white border-purple-500"
                                                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                                }`}
                                        >
                                            {prediction.optionA}
                                        </button>
                                        <button
                                            onClick={() => setWinner("OPTION_B")}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${winner === "OPTION_B"
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                                }`}
                                        >
                                            {prediction.optionB}
                                        </button>
                                    </div>
                                </div>

                                {/* Retroactive Cutoff */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Calendar size={12} />
                                        Retroactive Cutoff
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={cutoffDate}
                                        onChange={(e) => setCutoffDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                    />
                                    <div className="flex items-start gap-2 mt-2 text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded-lg">
                                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                        <p>Bets placed AFTER this time will be refunded (Anti-Cheat).</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSettle}
                                    disabled={!winner || isProcessing}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isProcessing ? "Settling..." : "Confirm Result"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
