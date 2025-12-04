import { cookies } from "next/headers";
import "server-only";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("campus_clash_session")?.value;

    if (!userId) {
        return null;
    }

    try {
        const { default: prisma } = await import("./prisma");
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                balance: true,
                wins: true,
                losses: true,
                isAdmin: true,
                isBanned: true,
                lastRefillDate: true,
            }
        });

        if (!user) return null;

        // Monthly Refill Logic (30 days = 2592000000 ms)
        const now = new Date();
        const lastRefill = new Date(user.lastRefillDate);
        const timeDiff = now.getTime() - lastRefill.getTime();

        if (timeDiff > 2592000000) {
            user = await prisma.user.update({
                where: { id: userId },
                data: {
                    balance: { increment: 5000 },
                    lastRefillDate: now
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    balance: true,
                    wins: true,
                    losses: true,
                    isAdmin: true,
                    isBanned: true,
                    lastRefillDate: true,
                }
            });
        }

        return user;
    } catch (error) {
        return null;
    }
}
