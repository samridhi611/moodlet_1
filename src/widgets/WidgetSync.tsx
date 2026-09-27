import { useEntries } from '@/context/EntriesContext';
import { useProfile } from '@/context/ProfileContext';
import { MoodId } from '@/theme/mood-data';
import { toDateString } from '@/utils/date';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { loadFriends } from './friends-store';
import { syncFriendsWidget, syncMoodWidget, syncWeekWidget } from './sync';

// Keeps the home screen widgets' AsyncStorage cache (src/widgets/widget-data.ts)
// in sync with live app state. Android-only — react-native-android-widget has
// no iOS/web native module to call.
export function WidgetSync() {
    const { username } = useProfile();
    const { entries, streak, todayEntry } = useEntries();

    useEffect(() => {
        if (Platform.OS !== 'android') return;
        syncMoodWidget({
            username: username ?? 'there',
            streak,
            todayMood: todayEntry?.mood ?? null,
        }).catch(() => {});
    }, [username, streak, todayEntry]);

    useEffect(() => {
        if (Platform.OS !== 'android') return;
        // Friends has no backend yet — load the locally persisted mock/reaction
        // state (src/widgets/friends-store.ts) so a reaction toggled in-app
        // survives an app restart instead of being overwritten by raw mock data.
        loadFriends()
            .then((friends) => syncFriendsWidget({ friends }))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (Platform.OS !== 'android') return;
        // WeekWave (a native widget) can't read Supabase-backed entries itself,
        // so the last 7 days get pre-computed here — same grouping the in-app
        // WeekWidget uses (src/components/widgets/MiniWidgets.tsx) — and pushed
        // to the widget's cache.
        const byDate = new Map<string, MoodId>();
        for (const e of entries) if (!byDate.has(e.entry_date)) byDate.set(e.entry_date, e.mood);

        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                label: d.toLocaleDateString('en', { weekday: 'narrow' }),
                moodId: byDate.get(toDateString(d)) ?? null,
                today: i === 6,
            };
        });

        syncWeekWidget({ days }).catch(() => {});
    }, [entries]);

    return null;
}
