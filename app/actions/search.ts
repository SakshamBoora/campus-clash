"use server";

export async function searchGlobal(query: string) {
    if (!query || query.length < 2) {
        return { markets: [], users: [] };
    }

    const { default: prisma } = await import("@/lib/prisma");

    const [markets, users] = await Promise.all([
        prisma.prediction.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { description: { contains: query, mode: "insensitive" } },
                        ],
                    },
                    {
                        status: { in: ["PENDING", "ACTIVE"] },
                    },
                    {
                        OR: [
                            { deadline: { gt: new Date() } },
                            { deadline: null }
                        ]
                    }
                ]
            },
            take: 5,
            select: { id: true, title: true, poolA: true, poolB: true },
        }),
        prisma.user.findMany({
            where: {
                name: { contains: query, mode: "insensitive" },
            },
            take: 5,
            select: { id: true, name: true },
        }),
    ]);

    return { markets, users };
}
