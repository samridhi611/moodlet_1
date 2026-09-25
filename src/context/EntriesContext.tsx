import { createEntry, deleteEntry, listEntries, updateEntry } from '@/api/entries';
import { Entry, NewEntryInput } from '@/types/entry';
import { daysAgoDateString, todayDateString } from '@/utils/date';
import { computeStreak } from '@/utils/streak';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

// How far back we pull entries for — a full year so Year in Pixels has
// something to render, and so the streak calc never runs out of history.
const HISTORY_WINDOW_DAYS = 365;

// docs/Moodlet_Design_Guide_v1.0.docx §2.1 — confetti + badge at 7/30/100 days.
const STREAK_MILESTONES = [7, 30, 100];

type EntriesContextValue = {
    entries: Entry[];
    todayEntry: Entry | null;
    streak: number;
    isLoading: boolean;
    error: string | null;
    milestone: number | null;
    refresh: () => Promise<void>;
    addEntry: (input: NewEntryInput) => Promise<Entry>;
    patchEntry: (entryId: string, updates: Partial<NewEntryInput>) => Promise<Entry>;
    removeEntry: (entryId: string) => Promise<void>;
    clearMilestone: () => void;
};

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [milestone, setMilestone] = useState<number | null>(null);

    const refresh = useCallback(async () => {
        if (!user) {
            setEntries([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await listEntries(user.id, daysAgoDateString(HISTORY_WINDOW_DAYS));
            setEntries(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load entries.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addEntry = useCallback(
        async (input: NewEntryInput) => {
            if (!user) throw new Error('Not authenticated.');

            const prevStreak = computeStreak(entries.map((entry) => entry.entry_date));
            const entry = await createEntry(user.id, input);
            const nextEntries = [entry, ...entries];
            setEntries(nextEntries);

            const nextStreak = computeStreak(nextEntries.map((e) => e.entry_date));
            if (nextStreak !== prevStreak && STREAK_MILESTONES.includes(nextStreak)) {
                setMilestone(nextStreak);
            }

            return entry;
        },
        [user, entries],
    );

    const clearMilestone = useCallback(() => setMilestone(null), []);

    const patchEntry = useCallback(async (entryId: string, updates: Partial<NewEntryInput>) => {
        const updated = await updateEntry(entryId, updates);
        setEntries((prev) => prev.map((entry) => (entry.id === entryId ? updated : entry)));
        return updated;
    }, []);

    const removeEntry = useCallback(async (entryId: string) => {
        await deleteEntry(entryId);
        setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    }, []);

    const todayEntry = useMemo(
        () => entries.find((entry) => entry.entry_date === todayDateString()) ?? null,
        [entries],
    );

    const streak = useMemo(
        () => computeStreak(entries.map((entry) => entry.entry_date)),
        [entries],
    );

    const value = useMemo<EntriesContextValue>(
        () => ({
            entries,
            todayEntry,
            streak,
            isLoading,
            error,
            milestone,
            refresh,
            addEntry,
            patchEntry,
            removeEntry,
            clearMilestone,
        }),
        [entries, todayEntry, streak, isLoading, error, milestone, refresh, addEntry, patchEntry, removeEntry, clearMilestone],
    );

    return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntries() {
    const ctx = useContext(EntriesContext);
    if (!ctx) throw new Error('useEntries must be used inside EntriesProvider.');
    return ctx;
}
