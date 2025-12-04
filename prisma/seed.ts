import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding realistic CampusClash demo data...");

    // -----------------------------
    // 1. CREATE USERS
    // -----------------------------
    const users = await prisma.user.createMany({
        data: [
            { name: "Saksham", email: "i24sakshams@iimidr.ac.in", password: "admin", balance: 12000, wins: 4, losses: 1, isAdmin: true },
            { name: "Aarav", email: "aarav@iimidr.ac.in", password: "123", balance: 8000, wins: 2, losses: 3 },
            { name: "Riya", email: "riya@iimidr.ac.in", password: "123", balance: 10500, wins: 5, losses: 2 },
            { name: "Kabir", email: "kabir@iimidr.ac.in", password: "123", balance: 6200, wins: 3, losses: 4 },
            { name: "Sana", email: "sana@iimidr.ac.in", password: "123", balance: 9500, wins: 6, losses: 1 },
            { name: "Arjun", email: "arjun@iimidr.ac.in", password: "123", balance: 7200, wins: 1, losses: 3 },
            { name: "Meera", email: "meera@iimidr.ac.in", password: "123", balance: 8400, wins: 4, losses: 2 },
            { name: "Dev", email: "dev@iimidr.ac.in", password: "123", balance: 5400, wins: 0, losses: 4 },
            { name: "Tara", email: "tara@iimidr.ac.in", password: "123", balance: 12000, wins: 5, losses: 1 },
            { name: "Ishaan", email: "ishaan@iimidr.ac.in", password: "123", balance: 6800, wins: 2, losses: 2 },
            { name: "Neha", email: "neha@iimidr.ac.in", password: "123", balance: 7600, wins: 3, losses: 2 },
            { name: "Raghav", email: "raghav@iimidr.ac.in", password: "123", balance: 4000, wins: 1, losses: 5 },
        ],
    });

    const allUsers = await prisma.user.findMany();

    // helpers
    const userByEmail = (email: string) => allUsers.find(u => u.email === email)?.id!;

    // -----------------------------
    // 2. CREATE PREDICTIONS
    // -----------------------------
    const predictions = await prisma.prediction.createMany({
        data: [
            {
                title: "Will tomorrow’s Quant Quiz average be above 7?",
                optionA: "YES",
                optionB: "NO",
                status: "PENDING",
                deadline: new Date(Date.now() + 86400000),
                poolA: 0,
                poolB: 0
            },
            {
                title: "Will Messi eat non-veg in mess today?",
                optionA: "YES",
                optionB: "NO",
                status: "PENDING",
                deadline: new Date(Date.now() + 3600000 * 6),
                poolA: 0,
                poolB: 0
            },
            {
                title: "Will Section C top the case competition?",
                optionA: "YES",
                optionB: "NO",
                status: "WON",
                deadline: new Date(Date.now() - 86400000 * 2),
                poolA: 0,
                poolB: 0
            },
            {
                title: "Will it rain during the 5PM lecture?",
                optionA: "YES",
                optionB: "NO",
                status: "LOST",
                deadline: new Date(Date.now() - 86400000 * 1),
                poolA: 0,
                poolB: 0
            }
        ]
    });

    const allPreds = await prisma.prediction.findMany();

    const pred = (title: string) => allPreds.find(p => p.title === title)!.id;

    // -----------------------------
    // 3. CREATE BETS (REALISTIC)
    // -----------------------------

    // PREDICTION 1 — Quant Quiz
    await prisma.bet.createMany({
        data: [
            { userId: userByEmail("aarav@iimidr.ac.in"), predictionId: pred("Will tomorrow’s Quant Quiz average be above 7?"), amount: 500, option: "A", status: "VALID" },
            { userId: userByEmail("riya@iimidr.ac.in"), predictionId: pred("Will tomorrow’s Quant Quiz average be above 7?"), amount: 1000, option: "A", status: "VALID" },
            { userId: userByEmail("kabir@iimidr.ac.in"), predictionId: pred("Will tomorrow’s Quant Quiz average be above 7?"), amount: 700, option: "B", status: "VALID" },
            { userId: userByEmail("sana@iimidr.ac.in"), predictionId: pred("Will tomorrow’s Quant Quiz average be above 7?"), amount: 300, option: "B", status: "VALID" },
        ]
    });

    // PREDICTION 2 — Messi eating non-veg in mess
    await prisma.bet.createMany({
        data: [
            { userId: userByEmail("arjun@iimidr.ac.in"), predictionId: pred("Will Messi eat non-veg in mess today?"), amount: 400, option: "A", status: "VALID" },
            { userId: userByEmail("meera@iimidr.ac.in"), predictionId: pred("Will Messi eat non-veg in mess today?"), amount: 600, option: "B", status: "VALID" },
            { userId: userByEmail("tara@iimidr.ac.in"), predictionId: pred("Will Messi eat non-veg in mess today?"), amount: 1000, option: "B", status: "VALID" },
        ]
    });

    // PREDICTION 3 — Section C case competition (YES won)
    await prisma.bet.createMany({
        data: [
            { userId: userByEmail("ishaan@iimidr.ac.in"), predictionId: pred("Will Section C top the case competition?"), amount: 500, option: "A", status: "WON", payout: 800 },
            { userId: userByEmail("neha@iimidr.ac.in"), predictionId: pred("Will Section C top the case competition?"), amount: 300, option: "A", status: "WON", payout: 450 },
            { userId: userByEmail("raghav@iimidr.ac.in"), predictionId: pred("Will Section C top the case competition?"), amount: 700, option: "B", status: "LOST", payout: 0 },
        ]
    });

    // PREDICTION 4 — Rain during lecture (NO won)
    await prisma.bet.createMany({
        data: [
            { userId: userByEmail("sana@iimidr.ac.in"), predictionId: pred("Will it rain during the 5PM lecture?"), amount: 900, option: "A", status: "LOST", payout: 0 },
            { userId: userByEmail("kabir@iimidr.ac.in"), predictionId: pred("Will it rain during the 5PM lecture?"), amount: 500, option: "B", status: "WON", payout: 1200 },
        ]
    });

    console.log("🌱 Seeding completed!");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
