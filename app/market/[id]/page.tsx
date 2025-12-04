import { notFound } from "next/navigation";
import { BattleCard } from "@/components/BattleCard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    const { default: prisma } = await import("@/lib/prisma");
    const prediction = await prisma.prediction.findUnique({
        where: { id },
    });

    if (!prediction) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-md">
                <BattleCard prediction={prediction} isLoggedIn={!!user} />
            </div>
        </div>
    );
}
