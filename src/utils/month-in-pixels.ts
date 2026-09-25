import { MoodId } from '@/theme/moods';
import { Entry } from '@/types/entry';
import { toDateString } from '@/utils/date';

export type MonthPixelDay = {
    date: string;
    day: number;
    mood: MoodId | null;
    inMonth: boolean;
};

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Builds a calendar-style month grid: rows of 7 (Sun–Sat), padded with the
 * trailing days of the previous/next month so every week is complete. Each
 * day's colour is its first/primary entry's mood, mirroring buildYearGrid.
 */
export const buildMonthGrid = (year: number, month: number, entries: Entry[]): MonthPixelDay[][] => {
    const moodByDate = new Map<string, MoodId>();
    for (let i = entries.length - 1; i >= 0; i -= 1) {
        moodByDate.set(entries[i].entry_date, entries[i].mood);
    }

    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const lastOfMonth = new Date(year, month + 1, 0);
    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

    const weeks: MonthPixelDay[][] = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
        const week: MonthPixelDay[] = [];
        for (let day = 0; day < 7; day += 1) {
            const inMonth = cursor.getMonth() === month && cursor.getFullYear() === year;
            const dateStr = toDateString(cursor);
            week.push({
                date: dateStr,
                day: cursor.getDate(),
                mood: inMonth ? moodByDate.get(dateStr) ?? null : null,
                inMonth,
            });
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
    }

    return weeks;
};
