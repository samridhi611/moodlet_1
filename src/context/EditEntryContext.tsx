import { Entry } from '@/types/entry';
import React, { createContext, useContext, useMemo, useState } from 'react';

type EditEntryContextValue = {
    entry: Entry | null;
    open: (entry: Entry) => void;
    close: () => void;
};

const EditEntryContext = createContext<EditEntryContextValue | null>(null);

export function EditEntryProvider({ children }: { children: React.ReactNode }) {
    const [entry, setEntry] = useState<Entry | null>(null);

    const value = useMemo<EditEntryContextValue>(
        () => ({
            entry,
            open: (next: Entry) => setEntry(next),
            close: () => setEntry(null),
        }),
        [entry],
    );

    return <EditEntryContext.Provider value={value}>{children}</EditEntryContext.Provider>;
}

export function useEditEntry() {
    const ctx = useContext(EditEntryContext);
    if (!ctx) throw new Error('useEditEntry must be used inside EditEntryProvider.');
    return ctx;
}
