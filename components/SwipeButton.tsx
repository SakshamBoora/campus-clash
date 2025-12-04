"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface SwipeButtonProps {
    onConfirm: () => Promise<boolean>;
    label?: string;
    disabled?: boolean;
}

export default function SwipeButton({ onConfirm, label = "Swipe to Bet", disabled = false }: SwipeButtonProps) {
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 200], [1, 0]);
    const bgOpacity = useTransform(x, [0, 200], [0.1, 1]);

    // Track width constraint (approximate based on button width)
    const dragConstraints = { left: 0, right: 200 };

    async function handleDragEnd(_: any, info: PanInfo) {
        if (info.offset.x > 150 && !disabled && !loading && !confirmed) {
            // Threshold reached
            setLoading(true);

            // Trigger action
            const success = await onConfirm();

            setLoading(false);

            if (success) {
                setConfirmed(true);

                // Confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#a855f7", "#3b82f6", "#ffffff"],
                });
            } else {
                // Reset logic is handled by dragSnapToOrigin
            }
        }
    }

    if (confirmed) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold gap-2 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
            >
                <Check size={20} />
                <span>Bet Placed!</span>
            </motion.div>
        );
    }

    return (
        <div className={`relative w-full h-12 rounded-full bg-white/5 border border-white/10 overflow-hidden ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
            {/* Background Fill Track */}
            <motion.div
                style={{ opacity: bgOpacity }}
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
            />

            {/* Label */}
            <motion.div
                style={{ opacity }}
                className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400 pointer-events-none uppercase tracking-widest"
            >
                {loading ? "Processing..." : label}
            </motion.div>

            {/* Handle */}
            <motion.div
                drag="x"
                dragConstraints={dragConstraints}
                dragElastic={0.1}
                dragMomentum={false}
                dragSnapToOrigin
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="absolute top-1 left-1 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <ChevronRight className="text-black" size={20} />
            </motion.div>
        </div>
    );
}
