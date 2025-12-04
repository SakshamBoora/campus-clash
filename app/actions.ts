"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function placeBet(predictionId: string, choice: "OPTION_A" | "OPTION_B", quantity: number = 1) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, message: "Unauthorized: Please sign in." };
        }

        const { default: prisma } = await import("@/lib/prisma");

        // Fetch prediction to get stake
        const prediction = await prisma.prediction.findUnique({
            where: { id: predictionId }
        });

        if (!prediction) {
            return { success: false, message: "Prediction market not found." };
        }

        const stakePerBet = prediction.stakeAmount || 100; // Default to 100 if null (shouldn't be)
        const totalCost = stakePerBet * quantity;

        if (user.balance < totalCost) {
            return { success: false, message: `Insufficient balance! You need ${totalCost} credits.` };
        }

        // Check for existing bets on this prediction to prevent hedging
        const existingBet = await prisma.bet.findFirst({
            where: {
                userId: user.id,
                predictionId: predictionId
            }
        });

        if (existingBet) {
            const newOption = choice === "OPTION_A" ? "A" : "B";
            if (existingBet.option !== newOption) {
                return {
                    success: false,
                    message: "You have already bet on the opposite outcome for this prediction."
                };
            }
        }

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx: any) => {
            // 1. Create the bet
            await tx.bet.create({
                data: {
                    amount: totalCost,
                    option: choice === "OPTION_A" ? "A" : "B",
                    userId: user.id,
                    predictionId: predictionId,
                },
            });

            // 2. Deduct balance
            await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: totalCost } },
            });

            // 3. Update prediction pool
            const poolUpdate = choice === "OPTION_A"
                ? { poolA: { increment: totalCost } }
                : { poolB: { increment: totalCost } };

            await tx.prediction.update({
                where: { id: predictionId },
                data: poolUpdate,
            });
        });

        revalidatePath("/");
        revalidatePath("/profile");
        return { success: true, message: `Bet placed! (${quantity}x shares)` };
    } catch (error) {
        console.error("Betting error:", error);
        return { success: false, message: "Failed to place bet." };
    }
}

export async function createPrediction(data: {
    title: string;
    description: string;
    stake: string;
    deadline: Date | null;
    optionA: string;
    optionB: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, message: "Unauthorized: Please sign in." };
        }

        const { default: prisma } = await import("@/lib/prisma");

        // Parse stake to integer
        console.log("Received stake:", data.stake, typeof data.stake);
        const stakeInt = parseInt(data.stake, 10);
        console.log("Parsed stake:", stakeInt);

        if (isNaN(stakeInt) || stakeInt <= 0) {
            console.error("Invalid stake amount:", stakeInt);
            return { success: false, message: "Invalid stake amount." };
        }

        await prisma.prediction.create({
            data: {
                title: data.title,
                description: data.description,
                stakeAmount: stakeInt,
                deadline: data.deadline,
                optionA: data.optionA,
                optionB: data.optionB,
                poolA: 0,
                poolB: 0,
            },
        });

        revalidatePath("/");
        return { success: true, message: "Prediction created!" };
    } catch (error) {
        console.error("Creation error:", error);
        return { success: false, message: "Failed to create prediction." };
    }
}

export async function settlePrediction(predictionId: string, winner: "OPTION_A" | "OPTION_B", actualResultDate: Date) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("campus_clash_session")?.value;

        if (!userId) throw new Error("Unauthorized");

        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            throw new Error("Unauthorized: Admin access required.");
        }

        // Anti-Cheat: Find bets placed AFTER the actual result time
        const lateBets = await prisma.bet.findMany({
            where: {
                predictionId,
                createdAt: { gt: actualResultDate },
                status: "VALID",
            },
        });

        // Fetch all valid bets for calculation
        const allBets = await prisma.bet.findMany({
            where: {
                predictionId,
                createdAt: { lte: actualResultDate },
                status: "VALID",
            },
        });

        const winningOption = winner === "OPTION_A" ? "A" : "B";
        const winningBets = allBets.filter(b => b.option === winningOption);
        const losingBets = allBets.filter(b => b.option !== winningOption);

        const totalWinningPool = winningBets.reduce((sum, b) => sum + b.amount, 0);
        const totalLosingPool = losingBets.reduce((sum, b) => sum + b.amount, 0);

        await prisma.$transaction(async (tx: any) => {
            // 1. Refund late bets
            for (const bet of lateBets) {
                await tx.user.update({
                    where: { id: bet.userId },
                    data: { balance: { increment: bet.amount } },
                });
                await tx.bet.update({
                    where: { id: bet.id },
                    data: { status: "INVALID" },
                });
            }

            // 2. Payout Winners (Pari-Mutuel Logic)
            // Formula: Payout = Stake + (Stake / TotalWinningPool) * TotalLosingPool
            // Winners receive their stake back plus a share of the losing pool.
            for (const bet of winningBets) {
                const userShare = bet.amount / totalWinningPool;
                const profit = Math.floor(userShare * totalLosingPool);
                const payout = bet.amount + profit;

                await tx.user.update({
                    where: { id: bet.userId },
                    data: {
                        balance: { increment: payout },
                        wins: { increment: 1 }
                    },
                });
                await tx.bet.update({
                    where: { id: bet.id },
                    data: {
                        status: "WON",
                        payout: payout
                    },
                });
            }

            // 3. Mark Losers
            await tx.bet.updateMany({
                where: {
                    predictionId,
                    createdAt: { lte: actualResultDate },
                    option: { not: winningOption },
                    status: "VALID",
                },
                data: { status: "LOST", payout: 0 },
            });

            // 4. Update Prediction Status
            await tx.prediction.update({
                where: { id: predictionId },
                data: { status: "WON" }, // Or "SETTLED"
            });
        });

        revalidatePath("/");
        revalidatePath("/leaderboard");
        revalidatePath("/profile");
        return { success: true, message: `Settled! ${lateBets.length} late bets refunded.` };
    } catch (error) {
        console.error("Settlement error:", error);
        return { success: false, message: "Failed to settle prediction." };
    }
}

export async function banUser(targetUserId: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("campus_clash_session")?.value;
        if (!userId) throw new Error("Unauthorized");

        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) throw new Error("Unauthorized: Admin access required.");

        const target = await prisma.user.findUnique({ where: { id: targetUserId } });
        const newStatus = !target?.isBanned;

        await prisma.user.update({
            where: { id: targetUserId },
            data: { isBanned: newStatus }
        });

        revalidatePath("/admin");
        return { success: true, message: newStatus ? "User banned." : "User unbanned." };
    } catch (error) {
        return { success: false, message: "Failed to update user status." };
    }
}

export async function updateBalance(targetUserId: string, amount: number) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("campus_clash_session")?.value;
        if (!userId) throw new Error("Unauthorized");

        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) throw new Error("Unauthorized: Admin access required.");

        await prisma.user.update({
            where: { id: targetUserId },
            data: { balance: { increment: amount } }
        });

        revalidatePath("/admin");
        return { success: true, message: "Balance updated." };
    } catch (error) {
        return { success: false, message: "Failed to update balance." };
    }
}

export async function deletePrediction(predictionId: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("campus_clash_session")?.value;
        if (!userId) throw new Error("Unauthorized");

        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) throw new Error("Unauthorized");

        // Delete bets first (cascade usually handles this but being safe)
        await prisma.bet.deleteMany({ where: { predictionId } });
        await prisma.prediction.delete({ where: { id: predictionId } });

        revalidatePath("/admin");
        return { success: true, message: "Prediction deleted." };
    } catch (error) {
        return { success: false, message: "Failed to delete prediction." };
    }
}

export async function getAdminData() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("campus_clash_session")?.value;
        if (!userId) return null;

        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) return null;

        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        const predictions = await prisma.prediction.findMany({
            orderBy: { createdAt: 'desc' },
            include: { creator: true }
        });

        return { users, predictions };
    } catch (error) {
        return null;
    }
}

export async function loginUser(email: string, password?: string) {
    try {
        const { default: prisma } = await import("@/lib/prisma");

        // 🔥 Hardcoded admin login
        if (email === "i24sakshams@iimidr.ac.in" && password === "saurabhsirgoat") {

            // Ensure admin exists in DB
            let admin = await prisma.user.findUnique({
                where: { email }
            });

            // If not in DB, create it
            if (!admin) {
                admin = await prisma.user.create({
                    data: {
                        name: "Saksham (Admin)",
                        email: email,
                        password: "ADMIN-HARDCODED",  // not used anymore
                        isAdmin: true,
                        balance: 10000
                    }
                });
            } else {
                // Ensure admin flag is true
                if (!admin.isAdmin) {
                    admin = await prisma.user.update({
                        where: { email },
                        data: { isAdmin: true }
                    });
                }
            }

            // Set cookie
            const cookieStore = await cookies();
            cookieStore.set("campus_clash_session", admin.id, { httpOnly: true, secure: true });

            return { success: true, userId: admin.id, user: admin };
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: false, code: "USER_NOT_FOUND", message: "User not found." };
        }

        // Verify Password (if provided)
        if (password) {
            const bcrypt = require("bcryptjs");
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return { success: false, code: "INVALID_PASSWORD", message: "Invalid password." };
            }
        }

        // Set Cookie
        const cookieStore = await cookies();
        cookieStore.set("campus_clash_session", user.id, { httpOnly: true, secure: true });

        return { success: true, userId: user.id, user };
    } catch (error: any) {
        console.error("Login error:", error);
        return { success: false, message: `Login failed: ${error.message}` };
    }
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete("campus_clash_session");
    return { success: true };
}

export async function getUserData(userId: string) {
    try {
        const { default: prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        return user;
    } catch (error) {
        return null;
    }
}

export async function registerUser(data: { name: string; email: string; password: string }) {
    try {
        const { default: prisma } = await import("@/lib/prisma");

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return { success: false, message: "User already exists." };
        }

        // 1. Email Domain Check
        if (!data.email.endsWith("@iimidr.ac.in")) {
            return { success: false, message: "Only @iimidr.ac.in emails are allowed." };
        }

        // 2. Password Strength Check
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (@ $ ! % * # ? &)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
        if (!passwordRegex.test(data.password)) {
            return {
                success: false,
                message: "Password must be 8+ characters and include uppercase, lowercase, number, and special character."
            };
        }

        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                balance: 1000, // Starting bonus
                wins: 0,
                losses: 0,
            },
        });

        // Set Cookie
        const cookieStore = await cookies();
        cookieStore.set("campus_clash_session", user.id, { httpOnly: true, secure: true });

        return { success: true, userId: user.id, user };
    } catch (error: any) {
        console.error("Registration error details:", error);
        return { success: false, message: `Registration failed: ${error.message}` };
    }
}

export async function withdrawCredits(amount: number) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("campus_clash_session")?.value;
        if (!userId) throw new Error("Unauthorized");

        const { default: prisma } = await import("@/lib/prisma");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        if (amount <= 0) {
            return { success: false, message: "Invalid amount." };
        }

        if (user.balance < amount) {
            return { success: false, message: "Insufficient balance." };
        }

        await prisma.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: amount } }
            });

            await tx.withdrawal.create({
                data: {
                    amount,
                    userId,
                    status: "COMPLETED" // Instant withdrawal for now
                }
            });
        });

        revalidatePath("/profile");
        return { success: true, message: `Successfully withdrew ${amount} credits.` };
    } catch (error) {
        console.error("Withdrawal error:", error);
        return { success: false, message: "Failed to withdraw credits." };
    }
}

export async function getWithdrawals() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("campus_clash_session")?.value;
        if (!userId) return [];

        const { default: prisma } = await import("@/lib/prisma");

        const withdrawals = await prisma.withdrawal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return withdrawals;
    } catch (error) {
        return [];
    }
}
