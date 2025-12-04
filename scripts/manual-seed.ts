import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_bgf9Kdwk1WFr@ep-orange-pond-a1o520tf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        }
    }
});

async function main() {
    console.log("Starting manual seed...");

    // 1. Create Admin User (Ensure it exists)
    const adminEmail = "i24sakshams@iimidr.ac.in";
    const adminPassword = await bcrypt.hash("saurabhsirgoat", 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { isAdmin: true, isBanned: false },
        create: {
            email: adminEmail,
            name: "Saksham (Admin)",
            password: adminPassword,
            isAdmin: true,
            balance: 50000
        }
    });
    console.log("Admin secured.");

    // 2. Create 10 Test Users
    console.log("Creating 10 test users...");
    const testUsers = [];
    for (let i = 1; i <= 10; i++) {
        const email = `user${i}@campusclash.com`;
        const password = await bcrypt.hash("password123", 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                balance: 1000 + (i * 100), // Different balances
            },
            create: {
                email,
                name: `Test User ${i}`,
                password,
                balance: 1000,
            }
        });
        testUsers.push(user);
        console.log(`Upserted ${email}`);
    }

    // 3. Create 10 Mock Markets
    console.log("Creating 10 mock markets...");
    const marketTopics = [
        "Will Bitcoin hit $100k by end of 2025?",
        "Will SpaceX land on Mars before 2030?",
        "Will the next iPhone be foldable?",
        "Will GTA VI release in 2025?",
        "Will AI replace software engineers by 2030?",
        "Will it rain in Mumbai tomorrow?",
        "Will India win the next Cricket World Cup?",
        "Will Tesla release a phone?",
        "Will the Fed cut rates next month?",
        "Will React still be dominant in 2030?"
    ];

    for (let i = 0; i < 10; i++) {
        const title = marketTopics[i];
        const existing = await prisma.prediction.findFirst({ where: { title } });

        if (!existing) {
            await prisma.prediction.create({
                data: {
                    title,
                    description: `Market prediction for: ${title}`,
                    stakeAmount: 100 + (i * 10), // Numeric stake
                    optionA: "Yes",
                    optionB: "No",
                    deadline: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Staggered deadlines
                    creatorId: admin.id,
                    poolA: Math.floor(Math.random() * 5000),
                    poolB: Math.floor(Math.random() * 5000),
                    status: "PENDING"
                }
            });
            console.log(`Created market: ${title}`);
        } else {
            console.log(`Market exists: ${title}`);
        }
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
