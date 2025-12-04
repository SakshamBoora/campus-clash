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
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        return user;
    } catch (error) {
        return null;
    }
}
