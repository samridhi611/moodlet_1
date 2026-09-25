import { ActivityId } from '@/theme/activities';
import { MoodId } from '@/theme/moods';

export type Entry = {
    id: string;
    user_id: string;
    mood: MoodId;
    activities: ActivityId[];
    note: string | null;
    entry_date: string; // 'YYYY-MM-DD', local calendar day the entry belongs to
    created_at: string;
};

export type NewEntryInput = {
    mood: MoodId;
    activities: ActivityId[];
    note: string | null;
};
