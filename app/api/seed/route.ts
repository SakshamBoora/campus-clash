import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { default: prisma } = await import("@/lib/prisma");
        console.log("Starting manual seed via API...");

        // 1. Create Admin User
        const adminEmail = "i24sakshams@iimidr.ac.in";
        const adminPassword = await bcrypt.hash("saurabhsirgoat", 10);

        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                password: adminPassword,
                name: "Saksham Boora",
                balance: 50000, // Ensure admin has funds
            },
            create: {
                email: adminEmail,
                name: "Saksham Boora",
                password: adminPassword,
                balance: 50000,
                wins: 0,
                losses: 0,
            },
        });

        // 2. Create Mock Markets
        const markets = [
            {
                title: "How many people will be part of Dec-Jan epidemic",
                description: "Predicting the scale of the outbreak.",
                stakeAmount: 100,
                optionA: "more than 20",
                optionB: "less than 20",
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            {
                title: "Will mid-term exam get postponed?",
                description: "Rumors are flying about a schedule change.",
                stakeAmount: 200,
                optionA: "Postponed",
                optionB: "On Time",
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
            {
                title: "Will hostel WiFi go down today?",
                description: "The daily struggle.",
                stakeAmount: 50,
                optionA: "Yes",
                optionB: "No",
                deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
            },
            {
                title: "Ind or SA",
                description: "Cricket match prediction.",
                stakeAmount: 500,
                optionA: "IND",
                optionB: "SA",
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            {
                title: "Will the mess serve good food on Sunday?",
                description: "Sunday special expectations.",
                stakeAmount: 100,
                optionA: "Yes",
                optionB: "No",
                deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            }
        ];

        const results = [];
        for (const market of markets) {
            const existing = await prisma.prediction.findFirst({
                where: { title: market.title }
            });

            if (!existing) {
                const p = await prisma.prediction.create({
                    data: {
                        ...market,
                        poolA: 0,
                        poolB: 0,
                        creatorId: admin.id,
                        status: "PENDING"
                    }
                });
                results.push(`Created: ${market.title}`);
            } else {
                results.push(`Skipped (Exists): ${market.title}`);
            }
        }

        return NextResponse.json({
            success: true,
            admin: admin.email,
            markets: results
        });

    } catch (error: any) {
        console.error("Seeding API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
