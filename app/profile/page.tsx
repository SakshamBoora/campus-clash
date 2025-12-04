import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Trophy, TrendingDown, History, Target, Calendar, Clock, Coins } from "lucide-react";
import WithdrawalForm from "@/components/WithdrawalForm";

export const dynamic = "force-dynamic";
export const revalidate = 0; // ALWAYS fetch fresh data

async function getUserStats(userId: string) {
    try {
        const { default: prisma } = await import("@/lib/prisma");
        const bets = await prisma.bet.findMany({
            where: { userId },
            include: { prediction: true },
            orderBy: { createdAt: "desc" },
        });

        return { bets };
    } catch (error) {
        console.error("Profile Stats Error:", error);
        return { bets: [] };
    }
}

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    const { bets } = await getUserStats(user.id);

    const totalBets = bets.length;
    const winRate = user.wins + user.losses > 0
        ? Math.round((user.wins / (user.wins + user.losses)) * 100)
        : 0;

    // Group bets by predictionId
    const groupedBetsMap = new Map();

    bets.forEach((bet: any) => {
        if (!groupedBetsMap.has(bet.predictionId)) {
            groupedBetsMap.set(bet.predictionId, {
                key: bet.predictionId,
                prediction: bet.prediction,
                options: new Set(),
                amount: 0,
                quantity: 0,
                createdAt: new Date(bet.createdAt), // Track latest bet time
                status: "VALID", // Default
                payout: 0
            });
        }

        const group = groupedBetsMap.get(bet.predictionId);

        // Aggregate
        group.amount += bet.amount;
        group.quantity += bet.amount / (bet.prediction.stakeAmount || 100);
        group.options.add(bet.option);
        group.payout += bet.payout || 0;

        // Update latest date
        if (new Date(bet.createdAt) > group.createdAt) {
            group.createdAt = new Date(bet.createdAt);
        }

        // Status Priority: WON > LOST > VALID
        if (bet.status === "WON") {
            group.status = "WON";
        } else if (bet.status === "LOST" && group.status !== "WON") {
            group.status = "LOST";
        }
    });

    const groupedBets = Array.from(groupedBetsMap.values()).map((group: any) => ({
        ...group,
        options: Array.from(group.options) // Convert Set to Array
    }));

    // Split into Current and Past
    const currentBets = groupedBets.filter((b: any) => b.status === "VALID");
    const pastBets = groupedBets.filter((b: any) => b.status === "WON" || b.status === "LOST");

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-12 mt-8">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-white/10">
                    {user.name?.[0] || "U"}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-white mb-2">{user.name}</h1>
                    <p className="text-gray-400 font-mono">{user.email}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Trophy size={18} className="text-yellow-400" />
                        <span className="text-xs uppercase tracking-wider font-bold">Wins</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{user.wins}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <TrendingDown size={18} className="text-red-400" />
                        <span className="text-xs uppercase tracking-wider font-bold">Losses</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{user.losses}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Target size={18} className="text-blue-400" />
                        <span className="text-xs uppercase tracking-wider font-bold">Win Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{winRate}%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <History size={18} className="text-purple-400" />
                        <span className="text-xs uppercase tracking-wider font-bold">Total Bets</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalBets}</p>
                </div>
            </div>

            {/* Current Bets Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="text-emerald-400" />
                    Current Bets
                </h2>
                <div className="space-y-4">
                    {currentBets.length > 0 ? (
                        currentBets.map((bet: any) => (
                            <div key={bet.key} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{bet.prediction.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {bet.createdAt.toLocaleDateString()}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-zinc-700 text-zinc-300">
                                                PENDING
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Your Option</p>
                                                <p className={`font-bold ${bet.options.includes('A') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {bet.options.map((opt: string) => opt === "A" ? bet.prediction.optionA : bet.prediction.optionB).join(", ")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Total Stake</p>
                                                <p className="text-white font-mono">₹{bet.amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:text-right bg-black/20 p-4 rounded-xl border border-white/5 min-w-[150px]">
                                        <div className="flex justify-between md:justify-end items-center gap-4">
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Quantity</span>
                                            <span className="text-white font-mono font-bold">{Math.round(bet.quantity)}x</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                            No active bets.
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Coins className="text-yellow-400" />
                    Withdraw Credits
                </h2>
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                    <WithdrawalForm balance={user.balance} />
                </div>
            </div>

            {/* Past Bets Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <History className="text-gray-400" />
                    Past Bets
                </h2>
                <div className="space-y-4">
                    {pastBets.length > 0 ? (
                        pastBets.map((bet: any) => {
                            const profit = bet.status === "WON" ? (bet.payout - bet.amount) : -bet.amount;
                            return (
                                <div key={bet.key} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors opacity-80 hover:opacity-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2">{bet.prediction.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {bet.createdAt.toLocaleDateString()}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${bet.status === 'WON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    {bet.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Your Option</p>
                                                    <p className="font-bold text-white">
                                                        {bet.options.map((opt: string) => opt === "A" ? bet.prediction.optionA : bet.prediction.optionB).join(", ")}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Total Stake</p>
                                                    <p className="text-white font-mono">₹{bet.amount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 md:text-right bg-black/20 p-4 rounded-xl border border-white/5 min-w-[150px]">
                                            <div className="flex justify-between md:justify-end items-center gap-4">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Result</span>
                                                <span className={`font-bold ${bet.status === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {bet.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between md:justify-end items-center gap-4">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Profit/Loss</span>
                                                <span className={`font-mono font-bold text-lg ${profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {profit > 0 ? '+' : ''}₹{profit.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                            No past bets.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
