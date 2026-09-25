import { daysAgoDateString, todayDateString } from '@/utils/date';

/**
 * Consecutive-day streak counting back from today. Today doesn't have to be
 * logged yet for the streak to still show as "alive" — it breaks only once
 * a full day is skipped, mirroring Daylio's forgiving streak behaviour.
 */
export const computeStreak = (entryDates: string[]): number => {
    const uniqueDates = new Set(entryDates);
    const today = todayDateString();

    let cursor = uniqueDates.has(today) ? 0 : 1;
    if (cursor === 1 && !uniqueDates.has(daysAgoDateString(1))) {
        return 0;
    }

    let streak = 0;
    while (uniqueDates.has(daysAgoDateString(cursor))) {
        streak += 1;
        cursor += 1;
    }

    return streak;
};
