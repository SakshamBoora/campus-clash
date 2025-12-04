import { Trophy, Medal, Award } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getLeaderboard() {
    try {
        const { default: prisma } = await import("@/lib/prisma");
        const users = await prisma.user.findMany({
            where: { isAdmin: false },
            orderBy: { balance: "desc" },
            take: 10,
        });
        return users;
    } catch (error) {
        console.error("Leaderboard Error:", error);
        return [];
    }
}

export default async function LeaderboardPage() {
    const users = await getLeaderboard();

    return (
        <div className="max-w-4xl mx-auto pt-24 pb-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-white mb-4">Leaderboard</h1>
                <p className="text-gray-400">Top predictors on campus. Are you on the list?</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">Rank</th>
                            <th className="px-6 py-4 font-medium">Student</th>
                            <th className="px-6 py-4 font-medium text-right">Wins</th>
                            <th className="px-6 py-4 font-medium text-right">Losses</th>
                            <th className="px-6 py-4 font-medium text-right">Win Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user, index) => {
                            const totalGames = user.wins + user.losses;
                            const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

                            return (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/profile/${user.id}`} className="flex items-center w-full h-full">
                                            {index === 0 && <Trophy className="text-yellow-400 mr-2" size={20} />}
                                            {index === 1 && <Medal className="text-gray-300 mr-2" size={20} />}
                                            {index === 2 && <Award className="text-amber-600 mr-2" size={20} />}
                                            <span className={`font-bold ${index < 3 ? 'text-white' : 'text-gray-500'}`}>
                                                #{index + 1}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/profile/${user.id}`} className="flex items-center w-full h-full">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white mr-3">
                                                {user.name?.[0] || "U"}
                                            </div>
                                            <span className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                                {user.name || "Anonymous"}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-400 font-bold">
                                        <Link href={`/profile/${user.id}`} className="block w-full h-full">
                                            {user.wins}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-400">
                                        <Link href={`/profile/${user.id}`} className="block w-full h-full">
                                            {user.losses}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                                        <Link href={`/profile/${user.id}`} className="block w-full h-full">
                                            {winRate}%
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No data available yet. Start betting!
                    </div>
                )}
            </div>
        </div>
    );
}
