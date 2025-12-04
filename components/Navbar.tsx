"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, TrendingUp, Trophy, LogOut, Sun, Moon, X, Plus, ShieldAlert } from "lucide-react";
import { useSearch } from "./SearchContext";
import { useModal } from "@/components/ModalContext";
import CreatePredictionModal from "./CreatePredictionModal";
import { logoutUser, getUserData } from "@/app/actions";
import { searchGlobal } from "@/app/actions/search";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const { searchQuery, setSearchQuery } = useSearch();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState<{ markets: any[], users: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const checkAuth = async () => {
        const userId = localStorage.getItem("campus_clash_user_id");
        if (userId) {
            const userData = await getUserData(userId);
            setUser(userData);
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        checkAuth();

        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener("auth-change", handleAuthChange);
        return () => window.removeEventListener("auth-change", handleAuthChange);
    }, []);

    // Close search on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchResults(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        localStorage.removeItem("campus_clash_auth");
        localStorage.removeItem("campus_clash_user_id");
        setUser(null);
        toast.success("Logged out successfully");
        window.location.href = "/";
    };



    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults(null);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchGlobal(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Prevent hydration mismatch
    if (!mounted) return null;

    const { openAuthModal } = useModal();

    const handleSignInClick = () => {
        openAuthModal();
    };

    return (
        <>
            <nav className="fixed top-0 w-full z-50 h-16 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 flex items-center px-6 shadow-sm dark:shadow-2xl transition-colors duration-300">
                {/* LEFT: LOGO */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/20 transition-all">
                            <TrendingUp size={18} className="text-white dark:text-black" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
                            Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">Clash</span>
                        </span>
                    </Link>
                </div>

                {/* MIDDLE: SEARCH */}
                <div className="hidden md:block w-full max-w-md mx-4" ref={searchRef}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search markets..."
                            className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(""); setSearchResults(null); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {searchResults && (searchResults.markets.length > 0 || searchResults.users.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    {searchResults.markets.length > 0 && (
                                        <div className="p-2">
                                            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider px-3 py-2">Markets</h4>
                                            {searchResults.markets.map(market => (
                                                <Link href={`/market/${market.id}`} key={market.id} className="flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg group transition-colors">
                                                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1">{market.title}</span>
                                                    <span className="text-xs font-mono text-zinc-400">Vol: ₹{(market.poolA + market.poolB).toLocaleString()}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.markets.length > 0 && searchResults.users.length > 0 && (
                                        <div className="h-px bg-zinc-200 dark:bg-white/10 mx-2" />
                                    )}

                                    {searchResults.users.length > 0 && (
                                        <div className="p-2">
                                            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider px-3 py-2">Users</h4>
                                            {searchResults.users.map(u => (
                                                <Link href={`/profile/${u.id}`} key={u.id} className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg group transition-colors">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                        {u.name?.[0]}
                                                    </div>
                                                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{u.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="flex-1 flex justify-end items-center gap-4">
                    {/* Theme Toggle Removed */}

                    <Link
                        href="/leaderboard"
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        <Trophy size={16} />
                        <span className="hidden sm:inline">Leaderboard</span>
                    </Link>

                    {user?.isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors text-sm font-bold whitespace-nowrap"
                        >
                            <ShieldAlert size={16} />
                            <span className="hidden sm:inline">Admin</span>
                        </Link>
                    )}

                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-emerald-500/20 whitespace-nowrap"
                                >
                                    <Plus size={14} /> Create
                                </button>

                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Balance</p>
                                    <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">₹{user.balance.toLocaleString()}</p>
                                </div>

                                <Link href={`/profile/${user.id}`}>
                                    <div className="w-9 h-9 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors border border-zinc-200 dark:border-white/10">
                                        <span className="text-sm font-bold text-zinc-700 dark:text-white">{user.name?.[0]}</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSignInClick}
                                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors whitespace-nowrap"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={handleSignInClick}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-bold text-sm rounded-full transition-all shadow-lg hover:shadow-emerald-500/20 whitespace-nowrap"
                                >
                                    Get Started
                                </button>
                            </div>
                        )
                    )}
                </div>
            </nav>

            <CreatePredictionModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </>
    );
}
