"use client";

import { motion } from "framer-motion";

const TICKER_ITEMS = [
    "🔥 500 students bet on 'Mess Paneer'",
    "💰 Rahul just won ₹2000 on 'Exam Cancelled'",
    "🚀 New Prediction: 'Campus Cat vs Dog'",
    "💎 Market Cap: ₹1.2 Lakhs",
    "📈 'Rain' odds spiking to 80%",
];

export default function LiveTicker() {
    return (
        <div className="w-full overflow-hidden bg-black/40 border-y border-white/5 py-2 mb-8 backdrop-blur-sm">
            <motion.div
                className="flex whitespace-nowrap gap-8"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20,
                }}
            >
                {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                    <span key={i} className="text-sm font-mono text-gray-400 flex items-center">
                        {item}
                        <span className="mx-4 text-white/10">•</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
