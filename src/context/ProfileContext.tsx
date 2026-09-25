import { getProfile, updateProfile } from '@/api/profile';
import { supabase } from '@/services/supabase';
import { Profile } from '@/types/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const USERNAME_STORAGE_KEY = '@moodlet_username';

type ProfileContextValue = {
    profile: Profile | null;
    username: string | null;
    saveUsername: (username: string) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const cleanUsername = (value: string) => value.trim().replace(/\s+/g, ' ');

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user) {
            setProfile(null);
            setUsername(null);
            return;
        }

        const fetchAndRoute = async () => {
            try {
                console.log(session)
                const p = await getProfile(session.user.id);
                setProfile(p);
                setUsername(p.username);

                if (!p.username) {
                    router.replace('/username-setup');
                } else {
                    router.replace('/(tabs)');
                }
            } catch (e) {
                console.error('Failed to fetch profile:', e);
            }
        };

        fetchAndRoute();
    }, [session]);

    const saveUsername = useCallback(async (rawUsername: string) => {
        const clean = cleanUsername(rawUsername);
        if (!clean) throw new Error('Username is required.');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated.');

        const updated = await updateProfile(user.id, { username: clean });
        await supabase.auth.updateUser({ data: { username: clean } });

        setProfile(updated);
        setUsername(clean);
        await AsyncStorage.setItem(USERNAME_STORAGE_KEY, clean);

        router.replace('/(tabs)');
    }, []);

    const value = useMemo<ProfileContextValue>(
        () => ({ profile, username, saveUsername }),
        [profile, saveUsername, username],
    );

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfile must be used inside ProfileProvider.');
    return ctx;
}