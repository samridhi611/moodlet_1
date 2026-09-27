import { MOOD_INFO as MOODS, MOOD_INFO_MAP as MOOD_MAP, MoodId } from '@/theme/mood-data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dateKey, loadHours } from './hours-store';
import { MOOD_EMOJI } from './mood-emoji';

export type MoodWidgetData = {
    username: string;
    streak: number;
    todayMood: MoodId | null;
};

export type FriendMoodEntry = {
    id: string;
    name: string;
    mood: MoodId;
    avatarColor: string;
    status: string;
    minutesAgo: number;
    reacted: boolean;
};

export type FriendsWidgetData = {
    friends: FriendMoodEntry[];
};

// 24 hourly slots for "today". A slot is null when nothing was logged for
// that hour. Deliberately carries no color — hour-bar/pill colors are
// resolved from the caller-supplied palette (src/widgets/palette-for-widgets.ts),
// not from moods.ts's tintBg/tintAccent (those are entry-card tints only).
export type HourCell = { moodId: MoodId; emoji: string; score: number } | null;

export type HourWidgetProps = {
    hours: HourCell[]; // 24 slots, index = hour of day (0-23)
    avgMoodId: MoodId | null;
    avgEmoji: string | null;
};

// One entry per day for the last 7 calendar days, oldest first, today last —
// for the WeekWave native widget (2x3). Computed in-app from useEntries()
// (see src/widgets/WidgetSync.tsx) since a headless widget process can't
// read Supabase-backed entries itself.
export type WeekDayCell = { label: string; moodId: MoodId | null; today: boolean };

export type WeekWidgetData = {
    days: WeekDayCell[]; // 7 entries
};

const MOOD_WIDGET_CACHE_KEY = '@moodlet_widget_mood_cache';
const FRIENDS_WIDGET_CACHE_KEY = '@moodlet_widget_friends_cache';
const HOURS_WIDGET_CACHE_KEY = '@moodlet_widget_hours_cache';
const WEEK_WIDGET_CACHE_KEY = '@moodlet_widget_week_cache';

const DEFAULT_MOOD_DATA: MoodWidgetData = {
    username: 'there',
    streak: 0,
    todayMood: null,
};

const DEFAULT_FRIENDS_DATA: FriendsWidgetData = {
    friends: [],
};

const DEFAULT_HOURS_DATA: HourWidgetProps = {
    hours: Array.from({ length: 24 }, () => null),
    avgMoodId: null,
    avgEmoji: null,
};

const DEFAULT_WEEK_DATA: WeekWidgetData = {
    days: Array.from({ length: 7 }, () => ({ label: '', moodId: null, today: false })),
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

export const writeHoursWidgetData = (data: HourWidgetProps) =>
    AsyncStorage.setItem(HOURS_WIDGET_CACHE_KEY, JSON.stringify(data));

export const readHoursWidgetData = async (): Promise<HourWidgetProps> => {
    const raw = await AsyncStorage.getItem(HOURS_WIDGET_CACHE_KEY);
    if (!raw) return DEFAULT_HOURS_DATA;
    try {
        return { ...DEFAULT_HOURS_DATA, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_HOURS_DATA;
    }
};

export const writeWeekWidgetData = (data: WeekWidgetData) =>
    AsyncStorage.setItem(WEEK_WIDGET_CACHE_KEY, JSON.stringify(data));

export const readWeekWidgetData = async (): Promise<WeekWidgetData> => {
    const raw = await AsyncStorage.getItem(WEEK_WIDGET_CACHE_KEY);
    if (!raw) return DEFAULT_WEEK_DATA;
    try {
        return { ...DEFAULT_WEEK_DATA, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_WEEK_DATA;
    }
};

// Finds the mood whose score is closest to a (possibly fractional) average score.
const moodForScore = (score: number): MoodId => {
    let closest = MOODS[0];
    let bestDelta = Math.abs(closest.score - score);
    for (const m of MOODS) {
        const delta = Math.abs(m.score - score);
        if (delta < bestDelta) {
            closest = m;
            bestDelta = delta;
        }
    }
    return closest.id;
};

// Builds today's hourly-timeline widget props straight from hours-store.ts's
// local AsyncStorage state (adapted from moodlet's src/widgets/data.ts
// hourWidgetProps(), which read from its in-memory MoodState instead).
export async function hourWidgetProps(): Promise<HourWidgetProps> {
    const hoursState = await loadHours();
    const map = hoursState[dateKey()] ?? {};

    const hours: HourCell[] = Array.from({ length: 24 }, (_, h) => {
        const moodId = map[h];
        if (!moodId) return null;
        return { moodId, emoji: MOOD_EMOJI[moodId], score: MOOD_MAP[moodId].score };
    });

    const logged = Object.values(map);
    let avgMoodId: MoodId | null = null;
    if (logged.length > 0) {
        const avgScore = logged.reduce((total, id) => total + MOOD_MAP[id].score, 0) / logged.length;
        avgMoodId = moodForScore(avgScore);
    }

    return { hours, avgMoodId, avgEmoji: avgMoodId ? MOOD_EMOJI[avgMoodId] : null };
}
