"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "All",
    "Academics",
    "Hostel",
    "Sports",
    "Placement",
    "Gossip",
    "Events",
    "Tech",
];

export default function CategoryBar() {
    const [active, setActive] = useState("All");

    return (
        <div className="sticky top-20 z-40 w-full bg-black/50 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 py-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActive(cat)}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap",
                                active === cat
                                    ? "bg-white text-black font-bold"
                                    : "text-gray-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
