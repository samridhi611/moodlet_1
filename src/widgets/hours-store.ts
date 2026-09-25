import { MoodId } from '@/theme/mood-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local-only hourly mood timeline. This is a genuinely new feature with no
// Supabase equivalent (the `entries` table is one row per day) — ported from
// moodlet's src/store/moodState.ts (dateKey/HourMap/applyHour) but kept as
// its own independent AsyncStorage-backed store, separate from
// EntriesContext/Supabase entirely.

export type HourMap = Record<number, MoodId>; // hour (0-23) -> mood

export type HoursState = Record<string, HourMap>; // dateKey -> hours

const HOURS_STORAGE_KEY = '@moodlet_hours';

export const dateKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Sets (or clears, when mood is null) the mood logged for a given hour on a given day. Pure — returns a new object. */
export function applyHour(
    hours: Record<string, HourMap>,
    hour: number,
    mood: MoodId | null,
    day = dateKey(),
): Record<string, HourMap> {
    const map = { ...hours[day] };
    if (mood) {
        map[hour] = mood;
    } else {
        delete map[hour];
    }
    return { ...hours, [day]: map };
}

export async function loadHours(): Promise<HoursState> {
    try {
        const raw = await AsyncStorage.getItem(HOURS_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as HoursState) : {};
    } catch {
        return {};
    }
}

export async function saveHours(hours: HoursState): Promise<void> {
    await AsyncStorage.setItem(HOURS_STORAGE_KEY, JSON.stringify(hours)).catch(() => {});
}
