"use client";

export default function AuroraBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute top-[10%] right-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>
    );
}
