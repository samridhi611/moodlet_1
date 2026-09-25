import { supabase } from '@/services/supabase';
import { Entry, NewEntryInput } from '@/types/entry';
import { todayDateString } from '@/utils/date';

export const createEntry = async (userId: string, input: NewEntryInput): Promise<Entry> => {
    const { data, error } = await supabase
        .from('entries')
        .insert({
            user_id: userId,
            mood: input.mood,
            activities: input.activities,
            note: input.note,
            entry_date: todayDateString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const listEntries = async (userId: string, sinceDate: string): Promise<Entry[]> => {
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', sinceDate)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
};

export const updateEntry = async (
    entryId: string,
    updates: Partial<NewEntryInput>,
): Promise<Entry> => {
    const { data, error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteEntry = async (entryId: string): Promise<void> => {
    const { error } = await supabase.from('entries').delete().eq('id', entryId);
    if (error) throw error;
};
