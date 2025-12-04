"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Mail, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { loginUser, registerUser } from "@/app/actions";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userId: string) => void;
    message?: string;
}

type AuthView = "LOGIN" | "SIGNUP" | "FORGOT_PASSWORD";

export default function AuthModal({ isOpen, onClose, onSuccess, message }: AuthModalProps) {
    const [view, setView] = useState<AuthView>("LOGIN");

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    // UI State
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Validation Logic
    const isSignInValid = email.trim() !== "" && password.trim() !== "" && !!captchaToken;
    const isSignUpValid = name.trim() !== "" && email.trim() !== "" && password.trim() !== "" && !!captchaToken;
    const isForgotValid = email.trim() !== "" && email.includes("@");

    const handleTabChange = (newView: AuthView) => {
        if (view === newView) return;

        // Clear errors on switch
        setError("");
        setSuccessMessage("");

        // Only clear Name if switching to Login (since Login doesn't need Name)
        // If switching to Signup, we want to keep Email/Password if user already typed them
        if (newView === "LOGIN") {
            setName("");
        }

        setView(newView);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            let result;
            if (view === "LOGIN") {
                result = await loginUser(email, password);
            } else {
                result = await registerUser({ name, email, password });
            }

            if (result.success && result.userId) {
                localStorage.setItem("campus_clash_auth", "true");
                localStorage.setItem("campus_clash_user_id", result.userId);
                window.dispatchEvent(new Event("auth-change"));
                onSuccess(result.userId);
                onClose();
            } else {
                if ((result as any).code === "USER_NOT_FOUND") {
                    setError("USER_NOT_FOUND");
                } else {
                    setError(result.message || "Authentication failed");
                }
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        setError("");

        // Mock API Call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Reset link sent!", {
            description: "Check your email for instructions.",
        });
        setSuccessMessage("If an account exists, a reset link has been sent to your email.");
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Custom Message */}
                        {message && (
                            <div className="relative z-10 px-6 pt-6 pb-2 text-center">
                                <p className="text-emerald-400 font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
                                    {message}
                                </p>
                            </div>
                        )}

                        {/* Header / Tabs */}
                        <div className="relative z-10 p-6 pb-0">
                            {view !== "FORGOT_PASSWORD" ? (
                                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                    <button
                                        onClick={() => handleTabChange("LOGIN")}
                                        className={twMerge(
                                            "flex-1 py-2 text-sm font-bold rounded-md transition-all",
                                            view === "LOGIN"
                                                ? "bg-white text-black shadow-lg"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("SIGNUP")}
                                        className={twMerge(
                                            "flex-1 py-2 text-sm font-bold rounded-md transition-all",
                                            view === "SIGNUP"
                                                ? "bg-white text-black shadow-lg"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center mb-2">
                                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                                    <p className="text-sm text-gray-400 mt-1">Don't worry, it happens to the best of us.</p>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="relative z-10 p-6 pt-6 flex-grow flex flex-col">

                            {/* FORGOT PASSWORD VIEW */}
                            {view === "FORGOT_PASSWORD" && (
                                <div className="space-y-4">
                                    {!successMessage ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="student@iimidr.ac.in"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleForgotPassword}
                                                disabled={!isForgotValid || loading}
                                                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                                            >
                                                {loading ? "Sending..." : "Send Reset Link"}
                                                {!loading && <ArrowRight size={16} />}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-green-400">
                                                <CheckCircle size={24} />
                                            </div>
                                            <p className="text-green-400 text-sm font-medium">{successMessage}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleTabChange("LOGIN")}
                                        className="w-full text-sm text-gray-400 hover:text-white transition-colors mt-2"
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            )}

                            {/* LOGIN & SIGNUP VIEWS */}
                            {view !== "FORGOT_PASSWORD" && (
                                <div className="space-y-4">
                                    {view === "SIGNUP" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="overflow-hidden"
                                        >
                                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Your Name"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="student@iimidr.ac.in"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
                                            {view === "LOGIN" && (
                                                <button
                                                    onClick={() => handleTabChange("FORGOT_PASSWORD")}
                                                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                    Forgot Password?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-center py-2">
                                        <ReCAPTCHA
                                            sitekey="6Lcz-R0sAAAAAOzmgzkO7OOd4T6IwQZKqkT8CwFX"
                                            onChange={(token) => setCaptchaToken(token)}
                                            theme="dark"
                                        />
                                    </div>

                                    {error && (
                                        <div className={clsx(
                                            "flex items-center gap-2 text-sm p-3 rounded-lg animate-pulse",
                                            error === "USER_NOT_FOUND" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                        )}>
                                            <AlertCircle size={16} />
                                            {error === "USER_NOT_FOUND" ? (
                                                <span>
                                                    No account found.{" "}
                                                    <button
                                                        onClick={() => handleTabChange("SIGNUP")}
                                                        className="underline font-bold hover:text-blue-300"
                                                    >
                                                        Sign Up?
                                                    </button>
                                                </span>
                                            ) : (
                                                error
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!(view === "LOGIN" ? isSignInValid : isSignUpValid) || loading}
                                        className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? "Processing..." : (view === "LOGIN" ? "Sign In" : "Create Account")}
                                        {!loading && <ArrowRight size={16} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
