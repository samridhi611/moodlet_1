import { useEntries } from '@/context/EntriesContext';
import { useProfile } from '@/context/ProfileContext';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { MOCK_FRIENDS } from './mock-friends';
import { syncFriendsWidget, syncMoodWidget } from './sync';

// Keeps the home screen widgets' AsyncStorage cache (src/widgets/widget-data.ts)
// in sync with live app state. Android-only — react-native-android-widget has
// no iOS/web native module to call.
export function WidgetSync() {
    const { username } = useProfile();
    const { streak, todayEntry } = useEntries();

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
        // Friends has no backend yet — seed the widget with sample data
        // (see src/widgets/mock-friends.ts) until the real social layer ships.
        syncFriendsWidget({ friends: MOCK_FRIENDS }).catch(() => {});
    }, []);

    return null;
}
