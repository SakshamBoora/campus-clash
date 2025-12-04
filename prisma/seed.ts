import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    // Clear existing data
    await prisma.bet.deleteMany();
    await prisma.prediction.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create Admin User (The Boss)
    const adminPassword = await bcrypt.hash("saurabhsirgoat", 10);
    const admin = await prisma.user.create({
        data: {
            email: "i24sakshams@iimidr.ac.in",
            name: "Saksham (Admin)",
            password: adminPassword,
            balance: 50000,
            wins: 99,
            losses: 0,
        },
    });
    console.log(`Created Admin: ${admin.name}`);

    // 2. Create Mock Users
    const mockUsers = [
        { name: "Rohan 'The Shark' Sharma", email: "rohan@iimidr.ac.in" },
        { name: "Priya 'Oracle' Patel", email: "priya@iimidr.ac.in" },
        { name: "Amit 'Yolo' Singh", email: "amit@iimidr.ac.in" },
        { name: "Sneha 'HODL' Gupta", email: "sneha@iimidr.ac.in" },
        { name: "Vikram 'Bear' Verma", email: "vikram@iimidr.ac.in" },
        { name: "Anjali 'Bull' Das", email: "anjali@iimidr.ac.in" },
        { name: "Rahul 'Degen' Kumar", email: "rahul@iimidr.ac.in" },
        { name: "Kavita 'Sniper' Reddy", email: "kavita@iimidr.ac.in" },
        { name: "Arjun 'Whale' Nair", email: "arjun@iimidr.ac.in" },
        { name: "Zara 'Moon' Khan", email: "zara@iimidr.ac.in" },
    ];

    const defaultPassword = await bcrypt.hash("password123", 10);

    for (const u of mockUsers) {
        await prisma.user.create({
            data: {
                email: u.email,
                name: u.name,
                password: defaultPassword,
                balance: Math.floor(Math.random() * 5000) + 1000,
                wins: Math.floor(Math.random() * 20),
                losses: Math.floor(Math.random() * 20),
            },
        });
    }
    console.log(`Created ${mockUsers.length} mock users.`);

    // 3. Create Predictions
    const predictions = await Promise.all([
        prisma.prediction.create({
            data: {
                title: "Will the Mess serve Paneer tonight?",
                description: "Rumors say it's Shahi Paneer, but could be Aloo Matar.",
                stakeAmount: 100,
                optionA: "Yes",
                optionB: "No",
                poolA: 0,
                poolB: 0,
                status: "PENDING",
                deadline: new Date(Date.now() + 3600 * 1000 * 5), // 5 hours from now
            },
        }),
        prisma.prediction.create({
            data: {
                title: "Will the IPM 07 batch mass bunk tomorrow?",
                description: "The 8:30 AM class is looking dangerous.",
                stakeAmount: 500,
                optionA: "Yes",
                optionB: "No",
                poolA: 0,
                poolB: 0,
                status: "PENDING",
                deadline: new Date(Date.now() + 3600 * 1000 * 12),
            },
        }),
        prisma.prediction.create({
            data: {
                title: "Will RCB win the IPL this year?",
                description: "Ee Sala Cup Namde?",
                stakeAmount: 1000,
                optionA: "Yes",
                optionB: "No",
                poolA: 0,
                poolB: 0,
                status: "PENDING",
                deadline: new Date(Date.now() + 3600 * 1000 * 24 * 30),
            },
        }),
    ]);

    // 4. Create Bets (5 per user to populate graphs)
    const allUsers = await prisma.user.findMany();

    for (const user of allUsers) {
        for (let i = 0; i < 5; i++) {
            const prediction = predictions[Math.floor(Math.random() * predictions.length)];
            const option = Math.random() > 0.5 ? "A" : "B";
            const status = Math.random() > 0.6 ? "WON" : Math.random() > 0.5 ? "LOST" : "VALID";
            const amount = 500;

            await prisma.bet.create({
                data: {
                    userId: user.id,
                    predictionId: prediction.id,
                    amount,
                    option,
                    status,
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)), // Random past date
                },
            });

            // Update pools
            if (option === "A") {
                await prisma.prediction.update({
                    where: { id: prediction.id },
                    data: { poolA: { increment: amount } }
                });
            } else {
                await prisma.prediction.update({
                    where: { id: prediction.id },
                    data: { poolB: { increment: amount } }
                });
            }
        }
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
