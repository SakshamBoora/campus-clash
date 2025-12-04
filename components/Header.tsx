"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User as UserIcon, LogOut, TrendingUp, Trophy } from "lucide-react";
import { useSearch } from "./SearchContext";
import AuthModal from "./AuthModal";
import { logoutUser, getUserData } from "@/app/actions";
import { toast } from "sonner";

export default function Header() {
    const { searchQuery, setSearchQuery } = useSearch();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const userId = localStorage.getItem("campus_clash_user_id");
            if (userId) {
                const userData = await getUserData(userId);
                setUser(userData);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        localStorage.removeItem("campus_clash_auth");
        localStorage.removeItem("campus_clash_user_id");
        setUser(null);
        toast.success("Logged out successfully");
    };

    const handleAuthSuccess = async (userId: string) => {
        const userData = await getUserData(userId);
        setUser(userData);
        setIsAuthOpen(false);
    };

    return (
        <>
            <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 h-16 shadow-xl">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-2 group z-10">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-purple-500/20 transition-all">
                        <TrendingUp size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">
                        Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Clash</span>
                    </span>
                </Link>

                {/* Middle: Search (Absolute Center) */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search markets or users..."
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 z-10">
                    <Link
                        href="/leaderboard"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <Trophy size={16} />
                        <span className="hidden sm:inline">Leaderboard</span>
                    </Link>

                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Balance</p>
                                    <p className="text-purple-400 font-mono font-bold">₹{user.balance.toLocaleString()}</p>
                                </div>

                                <Link href={`/profile/${user.id}`}>
                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10">
                                        <span className="text-xs font-bold">{user.name?.[0]}</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="px-4 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )
                    )}
                </div>
            </header>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    );
}
