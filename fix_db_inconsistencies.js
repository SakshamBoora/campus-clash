const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting DB Fix...");

    // 1. Normalize Statuses (Trim & Uppercase)
    const allPredictions = await prisma.prediction.findMany();
    for (const p of allPredictions) {
        const normalized = p.status.trim().toUpperCase();
        if (p.status !== normalized) {
            console.log(`Normalizing status for ${p.id}: '${p.status}' -> '${normalized}'`);
            await prisma.prediction.update({
                where: { id: p.id },
                data: { status: normalized }
            });
        }
    }

    // 2. Close Expired Predictions
    // Find PENDING predictions with deadline in the past
    const now = new Date();
    const expired = await prisma.prediction.findMany({
        where: {
            status: "PENDING",
            deadline: { lt: now }, // Strictly less than now
        }
    });

    console.log(`Found ${expired.length} expired PENDING predictions.`);

    for (const p of expired) {
        console.log(`Closing expired prediction: ${p.title} (Deadline: ${p.deadline})`);
        await prisma.prediction.update({
            where: { id: p.id },
            data: { status: "CLOSED" }
        });
    }

    console.log("DB Fix Complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
