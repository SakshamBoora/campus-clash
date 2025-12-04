const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const nullDeadlines = await prisma.prediction.count({
        where: { deadline: null },
    });
    console.log(`Predictions with null deadline: ${nullDeadlines}`);

    const all = await prisma.prediction.count();
    console.log(`Total predictions: ${all}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
