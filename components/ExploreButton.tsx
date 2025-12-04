"use client";

import { TrendingUp } from "lucide-react";

export function ExploreButton() {
    const handleScroll = () => {
        const element = document.getElementById("markets");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <button
            onClick={handleScroll}
            className="bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-extrabold py-4 px-8 rounded-full transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transform hover:-translate-y-1 flex items-center gap-2"
        >
            EXPLORE MARKETS <TrendingUp size={18} />
        </button>
    );
}
