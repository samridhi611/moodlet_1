import { supabase } from '@/services/supabase';
import { Profile } from '@/types/profile';

export const getProfile = async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
};

export const updateProfile = async (
    userId: string,
    updates: Partial<Pick<Profile, 'username'>>
): Promise<Profile> => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};