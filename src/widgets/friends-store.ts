import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_FRIENDS } from './mock-friends';
import { FriendMoodEntry } from './widget-data';

// Small AsyncStorage-backed store for the mock friends list + reaction state,
// used by the in-app FriendsMoodWidget card (src/components/widgets/FriendsMoodWidget.tsx)
// so a reaction tap persists across app restarts — same simple pattern as
// hours-store.ts. Friends still has no real backend (see src/widgets/mock-friends.ts),
// this just lets the mock data be mutated and remembered locally.

const FRIENDS_STORAGE_KEY = '@moodlet_friends';

export async function saveFriends(friends: FriendMoodEntry[]): Promise<void> {
    await AsyncStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends)).catch(() => {});
}

/** Reads the stored friends list, seeding it from MOCK_FRIENDS on first read. */
export async function loadFriends(): Promise<FriendMoodEntry[]> {
    try {
        const raw = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY);
        if (raw) return JSON.parse(raw) as FriendMoodEntry[];
    } catch {
        // fall through to seed
    }
    await saveFriends(MOCK_FRIENDS);
    return MOCK_FRIENDS;
}

/** Flips a friend's `reacted` flag, persists it, and returns the updated list. */
export async function toggleReaction(friendId: string): Promise<FriendMoodEntry[]> {
    const friends = await loadFriends();
    const updated = friends.map((f) => (f.id === friendId ? { ...f, reacted: !f.reacted } : f));
    await saveFriends(updated);
    return updated;
}
