"use client";
import { motion } from "framer-motion";

export function LiveActivity() {
    const activities = [
        { user: "Rohan", action: "bought YES", market: "Maggi Price Hike", time: "2s ago", color: "text-emerald-500 dark:text-emerald-400" },
        { user: "Priya", action: "bought NO", market: "Exam Postponed", time: "5s ago", color: "text-rose-500 dark:text-rose-400" },
        { user: "Amit", action: "created market", market: "Hostel Wi-Fi Down?", time: "12s ago", color: "text-blue-500 dark:text-blue-400" },
        { user: "Sneha", action: "won ₹500", market: "Cricket Match", time: "1m ago", color: "text-yellow-500 dark:text-yellow-400" },
    ];

    return (
        <div className="relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-2xl h-[400px] overflow-hidden">
            <h3 className="text-sm font-mono text-zinc-500 dark:text-zinc-500 mb-4 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5 pb-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Activity
            </h3>

            <div className="space-y-4">
                {activities.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col p-3 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-100 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-colors"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                    {item.user[0]}
                                </div>
                                <span className={`text-sm font-medium ${item.color}`}>
                                    <span className="text-zinc-900 dark:text-white">{item.user}</span> <span className="text-zinc-500 dark:text-zinc-400 font-normal">{item.action}</span>
                                </span>
                            </div>
                            <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">{item.time}</span>
                        </div>
                        <span className="text-xs text-zinc-500 pl-8 truncate">{item.market}</span>
                    </motion.div>
                ))}
            </div>

            {/* Fade at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>
    );
}