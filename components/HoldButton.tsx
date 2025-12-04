"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";
import clsx from "clsx";

interface HoldButtonProps {
    onComplete: () => void;
    label?: string;
    completedLabel?: string;
    className?: string;
}

export default function HoldButton({
    onComplete,
    label = "Hold to Bet",
    completedLabel = "Bet Placed!",
    className,
}: HoldButtonProps) {
    const [isHolding, setIsHolding] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const controls = useAnimation();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const HOLD_DURATION = 1000; // 1 second

    const startHold = () => {
        if (isCompleted) return;
        setIsHolding(true);
        controls.start({
            scaleX: 1,
            transition: { duration: HOLD_DURATION / 1000, ease: "linear" },
        });

        timeoutRef.current = setTimeout(() => {
            completeHold();
        }, HOLD_DURATION);
    };

    const endHold = () => {
        if (isCompleted) return;
        setIsHolding(false);
        controls.stop();
        controls.set({ scaleX: 0 });
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const completeHold = () => {
        setIsCompleted(true);
        setIsHolding(false);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#8b5cf6", "#3b82f6", "#ffffff"],
        });
        onComplete();
    };

    return (
        <div className="relative inline-block">
            <button
                onMouseDown={startHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={startHold}
                onTouchEnd={endHold}
                disabled={isCompleted}
                className={clsx(
                    "relative overflow-hidden px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-200 select-none",
                    isCompleted
                        ? "bg-green-500 text-white cursor-default"
                        : "bg-white/10 text-white hover:bg-white/20 active:scale-95 border border-white/10",
                    className
                )}
            >
                <span className="relative z-10">
                    {isCompleted ? completedLabel : label}
                </span>

                {/* Progress Fill */}
                {!isCompleted && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={controls}
                        className="absolute inset-0 bg-primary origin-left z-0 opacity-50"
                    />
                )}

                {/* Ring Animation (Optional visual cue) */}
                {isHolding && !isCompleted && (
                    <span className="absolute inset-0 rounded-full ring-2 ring-primary animate-pulse"></span>
                )}
            </button>
        </div>
    );
}
