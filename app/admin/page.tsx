"use client";

import { useEffect, useState } from "react";
import { getAdminData, banUser, deletePrediction, settlePrediction, updateBalance } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Ban, CheckCircle, XCircle } from "lucide-react";

export default function AdminPage() {
    const [data, setData] = useState<{ users: any[], predictions: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const result = await getAdminData();
            if (!result) {
                toast.error("Unauthorized");
                router.push("/");
                return;
            }
            setData(result);
            setLoading(false);
        };
        fetchData();
    }, [router]);

    const handleBan = async (userId: string) => {
        if (!confirm("Change ban status for this user?")) return;
        const res = await banUser(userId);
        if (res.success) {
            toast.success(res.message);
            window.location.reload();
        } else {
            toast.error(res.message);
        }
    };

    const handleUpdateBalance = async (userId: string, amount: number) => {
        const res = await updateBalance(userId, amount);
        if (res.success) {
            toast.success(res.message);
            window.location.reload();
        } else {
            toast.error(res.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this prediction?")) return;
        const res = await deletePrediction(id);
        if (res.success) {
            toast.success("Deleted");
            window.location.reload();
        } else {
            toast.error("Failed");
        }
    };

    const handleSettle = async (id: string, winner: "OPTION_A" | "OPTION_B") => {
        const dateStr = prompt("Enter actual result time (YYYY-MM-DD HH:MM:SS) or leave empty for NOW:");
        const date = dateStr ? new Date(dateStr) : new Date();

        const res = await settlePrediction(id, winner, date);
        if (res.success) {
            toast.success(res.message);
            window.location.reload();
        } else {
            toast.error(res.message);
        }
    };

    if (loading) return <div className="p-10 text-center text-zinc-500">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 space-y-12">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">God Mode</h1>

            {/* USERS */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Users ({data?.users.length})</h2>
                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 uppercase font-mono">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Balance</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-white/5 bg-white dark:bg-black">
                            {data?.users.map(u => (
                                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-white/5">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{u.name}</td>
                                    <td className="px-6 py-4 text-zinc-500">{u.email}</td>
                                    <td className="px-6 py-4 font-mono text-emerald-600">₹{u.balance}</td>
                                    <td className="px-6 py-4">
                                        {u.isBanned ? (
                                            <span className="text-rose-500 text-xs font-bold px-2 py-1 bg-rose-500/10 rounded-full">Banned</span>
                                        ) : (
                                            <span className="text-emerald-500 text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded-full">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button
                                            onClick={() => handleBan(u.id)}
                                            className={`p-2 rounded transition-colors ${u.isBanned ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-rose-500 hover:bg-rose-500/10'}`}
                                            title={u.isBanned ? "Unban User" : "Ban User"}
                                        >
                                            <Ban size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateBalance(u.id, 500)}
                                            className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded"
                                            title="Add 500 Credits"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => handleUpdateBalance(u.id, -500)}
                                            className="text-amber-500 hover:bg-amber-500/10 p-2 rounded"
                                            title="Remove 500 Credits"
                                        >
                                            -
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section >

            {/* PREDICTIONS */}
            < section className="space-y-4" >
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Predictions ({data?.predictions.length})</h2>
                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 uppercase font-mono">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Pools (A/B)</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-white/5 bg-white dark:bg-black">
                            {data?.predictions.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-white/5">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white max-w-xs truncate">{p.title}</td>
                                    <td className="px-6 py-4 font-mono text-zinc-500">₹{p.poolA} / ₹{p.poolB}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === 'WON' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleSettle(p.id, "OPTION_A")} className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded" title="Win Option A">
                                            <CheckCircle size={16} /> A
                                        </button>
                                        <button onClick={() => handleSettle(p.id, "OPTION_B")} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded" title="Win Option B">
                                            <CheckCircle size={16} /> B
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section >
        </div >
    );
}
