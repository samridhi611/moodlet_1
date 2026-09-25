import { MoodId } from '@/theme/moods';
import { Entry } from '@/types/entry';
import { toDateString } from '@/utils/date';

export type PixelDay = {
    date: string;
    mood: MoodId | null;
    inYear: boolean;
};

export type MonthLabel = {
    weekIndex: number;
    label: string;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Builds a Daylio-style "Year in Pixels" grid: 7 rows (Sun–Sat) x ~53 columns
 * (weeks), starting from the Sunday on/before Jan 1 so the whole year lines
 * up into full weeks. Each day's colour is its first/primary entry's mood.
 */
export const buildYearGrid = (
    year: number,
    entries: Entry[],
): { weeks: PixelDay[][]; monthLabels: MonthLabel[] } => {
    // Entries are ordered newest-first; reduceRight walks oldest-first so the
    // first entry of each day (chronologically) wins as that day's colour.
    const moodByDate = new Map<string, MoodId>();
    for (let i = entries.length - 1; i >= 0; i -= 1) {
        moodByDate.set(entries[i].entry_date, entries[i].mood);
    }

    const jan1 = new Date(year, 0, 1);
    const gridStart = new Date(jan1);
    gridStart.setDate(jan1.getDate() - jan1.getDay());

    const dec31 = new Date(year, 11, 31);
    const gridEnd = new Date(dec31);
    gridEnd.setDate(dec31.getDate() + (6 - dec31.getDay()));

    const weeks: PixelDay[][] = [];
    const monthLabels: MonthLabel[] = [];
    const seenMonths = new Set<number>();

    const cursor = new Date(gridStart);
    let weekIndex = 0;
    while (cursor <= gridEnd) {
        const week: PixelDay[] = [];
        for (let day = 0; day < 7; day += 1) {
            const inYear = cursor.getFullYear() === year;
            const dateStr = toDateString(cursor);

            if (inYear && cursor.getDate() <= 7 && !seenMonths.has(cursor.getMonth())) {
                seenMonths.add(cursor.getMonth());
                monthLabels.push({ weekIndex, label: MONTH_NAMES[cursor.getMonth()] });
            }

            week.push({
                date: dateStr,
                mood: inYear ? moodByDate.get(dateStr) ?? null : null,
                inYear,
            });
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
        weekIndex += 1;
    }

    return { weeks, monthLabels };
};
