"use client";

import { LogOut } from "lucide-react";

import { logoutUser } from "@/app/actions";

export default function LogoutButton() {
    const handleLogout = async () => {
        await logoutUser();
        localStorage.removeItem("campus_clash_auth");
        localStorage.removeItem("campus_clash_user_id");
        window.location.href = "/"; // Force reload
    };

    return (
        <button
            onClick={handleLogout}
            className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors"
            title="Log Out"
        >
            <LogOut size={20} />
        </button>
    );
}
