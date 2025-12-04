import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { SearchProvider } from "@/components/SearchContext";
import { ModalProvider } from "@/components/ModalContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CampusClash | The Stock Market for Campus",
  description: "Trade on exams, mess food, and hostel drama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans text-white antialiased overflow-x-hidden relative min-h-screen selection:bg-emerald-500/30`}>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <SearchProvider>
            <ModalProvider>
              <Navbar />
              <main className="flex-1 container mx-auto px-4 py-8 pt-20">
                {children}
              </main>
            </ModalProvider>
          </SearchProvider>
        </div>

      </body>
    </html>
  );
}