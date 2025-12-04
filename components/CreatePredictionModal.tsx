"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar, Coins } from "lucide-react";
import { useRouter } from "next/navigation";

import { createPrediction } from "@/app/actions";

interface CreatePredictionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatePredictionModal({ isOpen, onClose }: CreatePredictionModalProps) {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate min date (Current time + 1 hour)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const minDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const title = formData.get("title") as string;
        const stake = formData.get("stake") as string;
        const optionA = formData.get("optionA") as string;
        const optionB = formData.get("optionB") as string;
        const deadlineStr = formData.get("deadline") as string;

        // Client-side validation
        if (deadlineStr && new Date(deadlineStr) < new Date()) {
            alert("Deadline cannot be in the past.");
            setLoading(false);
            return;
        }

        const result = await createPrediction({
            title,
            stake,
            optionA,
            optionB,
            deadline: deadlineStr ? new Date(deadlineStr) : null,
        });

        setLoading(false);
        if (result.success) {
            window.dispatchEvent(new Event("auth-change"));
            router.refresh();
            onClose();
        } else {
            alert(result.message);
        }
    }

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/20 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl z-[10000]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0 bg-[#0a0a0a] rounded-t-2xl">
                            <h2 className="text-xl font-bold text-white">Create Prediction</h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="create-prediction-form" action={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Title <span className="text-red-500">*</span></label>
                                    <input
                                        name="title"
                                        required
                                        placeholder="e.g. Will it rain tomorrow?"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase flex items-center gap-1">
                                        <Coins size={12} className="text-yellow-400" />
                                        Price per Bet (Credits)
                                    </label>
                                    <input
                                        name="stake"
                                        type="number"
                                        min="1"
                                        required
                                        defaultValue="100"
                                        placeholder="e.g. 100"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Option A</label>
                                        <input
                                            name="optionA"
                                            required
                                            defaultValue="Yes"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Option B</label>
                                        <input
                                            name="optionB"
                                            required
                                            defaultValue="No"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Betting Closes At</label>
                                    <div className="relative">
                                        <input
                                            name="deadline"
                                            type="datetime-local"
                                            min={minDateTime}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Leave empty to keep betting open until the result is announced (Retroactive Cutoff).
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 shrink-0 bg-[#0a0a0a] rounded-b-2xl">
                            <button
                                type="submit"
                                form="create-prediction-form"
                                disabled={loading}
                                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating..." : "Launch Prediction"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return mounted ? createPortal(modalContent, document.body) : null;
}
