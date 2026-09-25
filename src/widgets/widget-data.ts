import { MoodId } from '@/theme/moods';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodWidgetData = {
    username: string;
    streak: number;
    todayMood: MoodId | null;
};

export type FriendMoodEntry = {
    id: string;
    name: string;
    mood: MoodId;
    timeLabel: string;
};

export type FriendsWidgetData = {
    friends: FriendMoodEntry[];
};

const MOOD_WIDGET_CACHE_KEY = '@moodlet_widget_mood_cache';
const FRIENDS_WIDGET_CACHE_KEY = '@moodlet_widget_friends_cache';

const DEFAULT_MOOD_DATA: MoodWidgetData = {
    username: 'there',
    streak: 0,
    todayMood: null,
};

const DEFAULT_FRIENDS_DATA: FriendsWidgetData = {
    friends: [],
};

// The widget task handler runs headless, outside the app's provider tree, so
// widget content is rendered from this cache rather than live app state. The
// app keeps the cache warm via writeMoodWidgetData / writeFriendsWidgetData
// (see src/widgets/sync.tsx) whenever the underlying data changes.
export const writeMoodWidgetData = (data: MoodWidgetData) =>
    AsyncStorage.setItem(MOOD_WIDGET_CACHE_KEY, JSON.stringify(data));

export const readMoodWidgetData = async (): Promise<MoodWidgetData> => {
    const raw = await AsyncStorage.getItem(MOOD_WIDGET_CACHE_KEY);
    if (!raw) return DEFAULT_MOOD_DATA;
    try {
        return { ...DEFAULT_MOOD_DATA, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_MOOD_DATA;
    }
};

export const writeFriendsWidgetData = (data: FriendsWidgetData) =>
    AsyncStorage.setItem(FRIENDS_WIDGET_CACHE_KEY, JSON.stringify(data));

export const readFriendsWidgetData = async (): Promise<FriendsWidgetData> => {
    const raw = await AsyncStorage.getItem(FRIENDS_WIDGET_CACHE_KEY);
    if (!raw) return DEFAULT_FRIENDS_DATA;
    try {
        return { ...DEFAULT_FRIENDS_DATA, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_FRIENDS_DATA;
    }
};
