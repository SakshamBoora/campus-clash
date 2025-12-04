const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pendingNull = await prisma.prediction.count({
        where: { status: 'PENDING', deadline: null }
    });
    const pendingFuture = await prisma.prediction.count({
        where: { status: 'PENDING', deadline: { gt: new Date() } }
    });
    const pendingPast = await prisma.prediction.count({
        where: { status: 'PENDING', deadline: { lte: new Date() } }
    });

    console.log(`PENDING + Null Deadline: ${pendingNull}`);
    console.log(`PENDING + Future Deadline: ${pendingFuture}`);
    console.log(`PENDING + Past Deadline: ${pendingPast}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
