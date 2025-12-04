"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AuthModal from "./AuthModal";
import BettingModal from "./BettingModal";

interface BettingModalData {
    predictionId: string;
    option: "A" | "B";
    title: string;
    optionLabel: string;
    stake: number;
}

interface ModalContextType {
    openAuthModal: (message?: string) => void;
    openBetModal: (data: BettingModalData) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [activeModal, setActiveModal] = useState<"AUTH" | "BETTING" | null>(null);
    const [authMessage, setAuthMessage] = useState<string | undefined>(undefined);
    const [bettingData, setBettingData] = useState<BettingModalData | null>(null);

    const openAuthModal = (message?: string) => {
        setAuthMessage(message);
        setActiveModal("AUTH");
    };

    const openBetModal = (data: BettingModalData) => {
        setBettingData(data);
        setActiveModal("BETTING");
    };

    const closeModal = () => {
        setActiveModal(null);
        setAuthMessage(undefined);
        setBettingData(null);
    };

    return (
        <ModalContext.Provider value={{ openAuthModal, openBetModal, closeModal }}>
            {children}

            <AuthModal
                isOpen={activeModal === "AUTH"}
                onClose={closeModal}
                onSuccess={() => {
                    // Just close for now. The component handles auth state updates via events/localStorage
                    closeModal();
                }}
                message={authMessage}
            />

            {bettingData && (
                <BettingModal
                    isOpen={activeModal === "BETTING"}
                    onClose={closeModal}
                    {...bettingData}
                />
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
