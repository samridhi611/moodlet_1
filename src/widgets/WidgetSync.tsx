import { useEntries } from '@/context/EntriesContext';
import { useProfile } from '@/context/ProfileContext';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { loadFriends } from './friends-store';
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
        // Friends has no backend yet — load the locally persisted mock/reaction
        // state (src/widgets/friends-store.ts) so a reaction toggled in-app
        // survives an app restart instead of being overwritten by raw mock data.
        loadFriends()
            .then((friends) => syncFriendsWidget({ friends }))
            .catch(() => {});
    }, []);

    return null;
}
