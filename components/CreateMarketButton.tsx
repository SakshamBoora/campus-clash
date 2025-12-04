"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import CreatePredictionModal from "@/components/CreatePredictionModal";
import { getUserData } from "@/app/actions";

interface CreateMarketButtonProps {
    isLoggedIn: boolean;
}

export function CreateMarketButton({ isLoggedIn }: CreateMarketButtonProps) {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleCreateClick = () => {
        if (isLoggedIn) {
            setIsCreateOpen(true);
        } else {
            setIsAuthOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleCreateClick}
                className="bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-extrabold py-4 px-8 rounded-full transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transform hover:-translate-y-1 flex items-center gap-2"
            >
                START BETTING <Plus size={18} />
            </button>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={() => {
                    setIsAuthOpen(false);
                    setIsCreateOpen(true);
                }}
                message="Sign in to start betting."
            />

            <CreatePredictionModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </>
    );
}
