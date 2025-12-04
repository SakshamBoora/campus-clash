"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { loginUser } from "@/app/actions";

export default function LoginOverlay() {
    const [isVisible, setIsVisible] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user is already logged in
        const auth = localStorage.getItem("campus_clash_auth");
        if (auth === "true") {
            setIsVisible(false);
        }
    }, []);

    const handleLogin = async () => {
        if (!captchaToken || !email || !password) return;

        setLoading(true);
        setError("");

        const result = await loginUser(email);

        if (result.success && result.userId) {
            localStorage.setItem("campus_clash_auth", "true");
            localStorage.setItem("campus_clash_user_id", result.userId);
            setIsVisible(false);
            window.location.href = "/"; // Explicit redirect to Home
        } else {
            setError(result.message || "Login failed");
        }
        setLoading(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Lock size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">CampusClash Access</h1>
                        <p className="text-gray-400 text-sm">Enter your student credentials to continue.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Student Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="student@iimidr.ac.in"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        {/* Real CAPTCHA */}
                        <div className="flex justify-center">
                            <ReCAPTCHA
                                sitekey="6Lcz-R0sAAAAAOzmgzkO7OOd4T6IwQZKqkT8CwFX"
                                onChange={(token) => setCaptchaToken(token)}
                                theme="dark"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={!captchaToken || !email || !password || loading}
                            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? "Verifying..." : "Enter Campus"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
