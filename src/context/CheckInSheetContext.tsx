import React, { createContext, useContext, useMemo, useState } from 'react';

type CheckInSheetContextValue = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

const CheckInSheetContext = createContext<CheckInSheetContextValue | null>(null);

export function CheckInSheetProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const value = useMemo<CheckInSheetContextValue>(
        () => ({
            isOpen,
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
        }),
        [isOpen],
    );

    return <CheckInSheetContext.Provider value={value}>{children}</CheckInSheetContext.Provider>;
}

export function useCheckInSheet() {
    const ctx = useContext(CheckInSheetContext);
    if (!ctx) throw new Error('useCheckInSheet must be used inside CheckInSheetProvider.');
    return ctx;
}
