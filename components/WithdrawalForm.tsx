"use client";

import { useState } from "react";
import { withdrawCredits } from "@/app/actions";
import { Coins, Loader2 } from "lucide-react";

export default function WithdrawalForm({ balance }: { balance: number }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleWithdraw = async () => {
        const val = parseInt(amount);
        if (isNaN(val) || val <= 0) {
            setMessage("Please enter a valid amount.");
            return;
        }
        if (val > balance) {
            setMessage("Insufficient balance.");
            return;
        }

        setLoading(true);
        setMessage("");

        const res = await withdrawCredits(val);
        setLoading(false);
        setMessage(res.message);
        if (res.success) {
            setAmount("");
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">
                        Amount to Withdraw
                    </label>
                    <div className="relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Enter amount..."
                        />
                    </div>
                </div>
                <button
                    onClick={handleWithdraw}
                    disabled={loading || !amount}
                    className="w-full md:w-auto bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Withdraw"}
                </button>
            </div>
            {message && (
                <p className={`mt-4 text-sm font-bold ${message.includes("Success") ? "text-emerald-400" : "text-rose-400"}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
