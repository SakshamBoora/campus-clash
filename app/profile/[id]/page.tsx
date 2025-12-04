import { notFound } from "next/navigation";
import { Trophy, TrendingUp, History, Wallet, Flame, Star } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let user = null;

    try {
        const { default: prisma } = await import("@/lib/prisma");

        user = await prisma.user.findUnique({
            where: { id },
            include: {
                bets: {
                    orderBy: { createdAt: "desc" },
                    include: { prediction: true },
                },
            },
        });
    } catch (error) {
        console.error("Profile Page Error:", error);
    }

    if (!user) {
        notFound();
    }

    // Calculate Metrics
    const totalBets = user.bets.length;
    const wins = user.bets.filter(b => b.status === "WON").length;
    const losses = user.bets.filter(b => b.status === "LOST").length;
    const winRate = totalBets > 0 ? Math.round((wins / (wins + losses || 1)) * 100) : 0;

    // Net Profit: (Wins * Stake) - (Losses * Stake) - assuming fixed 500 stake for now
    // In a real app, we'd sum actual amounts.
    const netProfit = user.bets.reduce((acc, bet) => {
        if (bet.status === "WON") return acc + bet.amount;
        if (bet.status === "LOST") return acc - bet.amount;
        return acc;
    }, 0);

    // Win Streak
    let currentStreak = 0;
    for (const bet of user.bets) { // bets are ordered desc
        if (bet.status === "WON") currentStreak++;
        else if (bet.status === "LOST") break;
    }

    // Favorite Category (Infer from titles)
    const categories: Record<string, number> = {};
    user.bets.forEach(bet => {
        const title = bet.prediction.title.toLowerCase();
        let cat = "General";
        if (title.includes("mess") || title.includes("food")) cat = "Mess Food";
        else if (title.includes("exam") || title.includes("grade") || title.includes("class")) cat = "Academics";
        else if (title.includes("sport") || title.includes("cricket")) cat = "Sports";
        else if (title.includes("hostel") || title.includes("room")) cat = "Hostel Life";

        categories[cat] = (categories[cat] || 0) + 1;
    });
    const favoriteCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "General";

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-white/10">
                        {user.name?.[0] || "U"}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 text-sm font-bold flex items-center gap-1">
                                <Trophy size={14} />
                                Rank #{Math.floor(Math.random() * 10) + 1}
                            </span>
                            <span className="text-gray-400 text-sm">{user.email}</span>
                        </div>
                    </div>
                </div>

                {/* Logout Button (Top Right relative to container, or just flex-end) */}
                <div className="absolute top-0 right-0 md:static md:self-start">
                    <LogoutButton />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Wallet size={18} className="text-green-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Net Profit</span>
                    </div>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {netProfit > 0 ? "+" : ""}{netProfit}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <TrendingUp size={18} className="text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{winRate}%</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Flame size={18} className="text-orange-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{currentStreak} 🔥</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Star size={18} className="text-purple-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Favorite</span>
                    </div>
                    <div className="text-xl font-bold text-white truncate">{favoriteCategory}</div>
                </div>
            </div>

            {/* Betting History */}
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <History className="text-purple-500" />
                Recent Activity
            </h2>

            <div className="space-y-4">
                {user.bets.slice(0, 10).map((bet) => (
                    <div key={bet.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <div>
                            <h3 className="text-white font-medium mb-1">{bet.prediction.title}</h3>
                            <p className="text-sm text-gray-400">
                                Bet on: <span className="text-white font-bold">{bet.option === "A" ? bet.prediction.optionA : bet.prediction.optionB}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-bold ${bet.status === "WON" ? "text-green-400" :
                                bet.status === "LOST" ? "text-red-400" : "text-yellow-400"
                                }`}>
                                {bet.status === "WON" ? `+${bet.amount}` :
                                    bet.status === "LOST" ? `-${bet.amount}` : "PENDING"}
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(bet.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}

                {user.bets.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No bets placed yet.
                    </div>
                )}
            </div>
        </div>
    );
}
