import { getCurrentUser } from "@/lib/auth";
import { Trophy, TrendingDown, History, Target, Calendar, Coins } from "lucide-react";
import { redirect } from "next/navigation";

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
    const totalStaked = bets.reduce((acc: number, bet: any) => acc + bet.amount, 0);
    const winRate = user.wins + user.losses > 0
        ? Math.round((user.wins / (user.wins + user.losses)) * 100)
        : 0;

    // Group bets by predictionId
    const groupedBets = bets.reduce((acc: any[], bet: any) => {
        const existing = acc.find((item) => item.prediction.id === bet.predictionId);

        if (existing) {
            existing.amount += bet.amount;
            existing.quantity += bet.amount / (bet.prediction.stakeAmount || 100);

            // Track options
            if (!existing.options.includes(bet.option)) {
                existing.options.push(bet.option);
            }

            // Keep the latest date
            if (new Date(bet.createdAt) > new Date(existing.createdAt)) {
                existing.createdAt = bet.createdAt;
            }

            // Status logic: If any bet is WON, the group is WON. If any LOST, LOST. 
            // If mixed (e.g. one WON, one LOST), we can show "SETTLED". 
            // If all VALID, PENDING.
            if (bet.status === "WON") existing.status = "WON";
            else if (bet.status === "LOST" && existing.status !== "WON") existing.status = "LOST";

        } else {
            acc.push({
                key: bet.predictionId,
                prediction: bet.prediction,
                options: [bet.option],
                amount: bet.amount,
                quantity: bet.amount / (bet.prediction.stakeAmount || 100),
                createdAt: bet.createdAt,
                status: bet.status // VALID, WON, LOST
            });
        }
        return acc;
    }, []);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-white/10">
                    {user.name?.[0] || "U"}
                </div>
                <div>
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

            {/* Betting History */}
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <History className="text-gray-400" />
                Betting History
            </h2>

            <div className="space-y-4">
                {groupedBets.map((bet: any) => {
                    const isSettled = bet.status === "WON" || bet.status === "LOST";
                    const profit = bet.status === "WON" ? bet.amount : (bet.status === "LOST" ? -bet.amount : 0);
                    const optionLabel = bet.options.map((opt: string) => opt === "A" ? bet.prediction.optionA : bet.prediction.optionB).join(", ");

                    return (
                        <div
                            key={bet.key}
                            className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">{bet.prediction.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(bet.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${bet.status === 'VALID' ? 'bg-zinc-700 text-zinc-300' : (bet.status === 'WON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}`}>
                                            {bet.status === 'VALID' ? 'PENDING' : bet.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Your Option</p>
                                            <p className="font-bold text-white">
                                                {optionLabel}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Quantity</p>
                                            <p className="text-white font-mono">{bet.quantity}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Total Stake</p>
                                            <p className="text-white font-mono">₹{bet.amount.toLocaleString()}</p>
                                        </div>

                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 md:text-right bg-black/20 p-4 rounded-xl border border-white/5 min-w-[200px]">
                                    {isSettled ? (
                                        <>
                                            <div className="flex justify-between md:justify-end items-center gap-4">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Result</span>
                                                <span className={`font-bold ${profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {profit > 0 ? 'WON' : 'LOST'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between md:justify-end items-center gap-4">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Profit/Loss</span>
                                                <span className={`font-mono font-bold text-lg ${profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {profit > 0 ? '+' : ''}₹{profit.toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm italic">
                                            Result Pending
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {groupedBets.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                        No bets placed yet. Go make some predictions!
                    </div>
                )}
            </div>
        </div>
    );
}
