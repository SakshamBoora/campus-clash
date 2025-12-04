const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pending = await prisma.prediction.count({ where: { status: 'PENDING' } });
    const active = await prisma.prediction.count({ where: { status: 'ACTIVE' } });
    const won = await prisma.prediction.count({ where: { status: 'WON' } });
    const lost = await prisma.prediction.count({ where: { status: 'LOST' } });

    console.log(`PENDING: ${pending}`);
    console.log(`ACTIVE: ${active}`);
    console.log(`WON: ${won}`);
    console.log(`LOST: ${lost}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
