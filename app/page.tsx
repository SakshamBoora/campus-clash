import { BattleCard } from "@/components/BattleCard";
import { PredictionGrid } from "@/components/PredictionGrid";
import { CreateMarketButton } from "@/components/CreateMarketButton";
import { getCurrentUser } from "@/lib/auth";
import { Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

import type { Prediction, User } from "@prisma/client";

export default async function Home() {
  let user = null;
  let predictions: (Prediction & { creator: User | null })[] = [];
  let topUsers: User[] = [];

  try {
    user = await getCurrentUser().catch(() => null);

    const { default: prisma } = await import("@/lib/prisma");

    // SAFEGUARD: Automatically close expired predictions
    // If a prediction is PENDING but the deadline has passed, mark it as CLOSED.
    await prisma.prediction.updateMany({
      where: {
        status: "PENDING",
        deadline: { lt: new Date() }
      },
      data: { status: "CLOSED" }
    });

    // Fetch Predictions
    predictions = await prisma.prediction.findMany({
      where: {
        status: { in: ["PENDING", "ACTIVE"] },
        OR: [
          { deadline: { gt: new Date() } },
          { deadline: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { creator: true },
    });

    // Fetch Leaderboard (Top 10 by Balance, exclude admins)
    topUsers = await prisma.user.findMany({
      where: { isAdmin: false },
      orderBy: { balance: 'desc' },
      take: 10,
    });

  } catch (error) {
    console.error("Home Page Error:", error);
  }

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION (Split View) */}
      <section className="relative pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Text */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold font-mono tracking-wide">
              <span className="relative flex h-2.5 w-2.5 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              LIVE MARKET ACTIVE
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
              The Stock Market for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 dark:from-emerald-400 dark:via-cyan-400 dark:to-purple-500">
                Campus Chaos.
              </span>
            </h1>

            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Trade on exams, mess food, and hostel drama. Put your reputation on the line and climb the leaderboard.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <CreateMarketButton isLoggedIn={!!user} />
            </div>
          </div>

          {/* Right: Leaderboard (Glass Panel) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">

              {/* LEADERBOARD PANEL */}
              <div className="relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-2xl h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-white/5 pb-2">
                  <h3 className="text-sm font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={14} className="text-yellow-500" />
                    Top Traders
                  </h3>
                  <Link href="/leaderboard" className="text-xs text-emerald-500 hover:text-emerald-400 font-bold">
                    View All
                  </Link>
                </div>

                <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
                  {topUsers.map((u, i) => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-100 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' :
                          i === 1 ? 'bg-gray-300 text-black' :
                            i === 2 ? 'bg-amber-600 text-white' :
                              'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {u.wins} Wins
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{u.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {topUsers.length === 0 && (
                    <p className="text-center text-zinc-500 text-sm py-10">No data yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE MARKETS (Grid View) */}
      <section id="markets">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Active Markets
            </h2>
          </div>
          {/* Tags Removed */}
        </div>

        {/* THE GRID: Forces 3 columns */}
        <PredictionGrid predictions={predictions} isLoggedIn={!!user} />
      </section>
    </div>
  );
}
