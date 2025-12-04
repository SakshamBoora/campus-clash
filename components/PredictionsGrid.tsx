"use client";

import { useSearch } from "./SearchContext";
import { BattleCard } from "./BattleCard";
import { TrendingUp } from "lucide-react";

interface PredictionsGridProps {
    predictions: any[];
    isLoggedIn: boolean;
}

export default function PredictionsGrid({ predictions, isLoggedIn }: PredictionsGridProps) {
    const { searchQuery } = useSearch();

    const filteredPredictions = predictions.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredPredictions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50 border border-dashed border-white/10 rounded-2xl">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp size={40} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white">No Matches Found</h3>
                <p className="text-gray-500">Try searching for something else.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPredictions.map((prediction) => (
                <BattleCard key={prediction.id} prediction={prediction} isLoggedIn={isLoggedIn} />
            ))}
        </div>
    );
}
