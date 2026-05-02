import { getProfile } from '@/api/profile';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { Profile } from '@/types/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const USERNAME_STORAGE_KEY = '@moodlet_username';
const GUEST_SESSION_KEY = '@moodlet_guest_session';

type AuthMode = 'guest' | 'supabase' | null;

type AuthContextValue = {
  isReady: boolean;
  isSignedIn: boolean;
  mode: AuthMode;
  session: Session | null;
  user: User | null;
  username: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const cleanUsername = (value: string) => value.trim().replace(/\s+/g, ' ');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<AuthMode>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const [{ data }, savedUsername, savedGuest] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem(USERNAME_STORAGE_KEY),
        AsyncStorage.getItem(GUEST_SESSION_KEY),
      ]);

      if (!mounted) return;

      // Prefer username stored in Supabase metadata, fall back to local storage
      const metadataUsername = data.session?.user.user_metadata?.username as string | undefined;
      const nextUsername = metadataUsername ?? savedUsername;

      setSession(data.session);
      setUsername(nextUsername);
      setMode(data.session ? 'supabase' : savedGuest === 'true' ? 'guest' : null);
      setIsReady(true);
    };

    hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const metadataUsername = nextSession?.user.user_metadata?.username as string | undefined;

      setSession(nextSession);
      setMode(nextSession ? 'supabase' : null);

      if (metadataUsername) {
        setUsername(metadataUsername);
        AsyncStorage.setItem(USERNAME_STORAGE_KEY, metadataUsername);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);


  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before using Google login.');
    }

    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) throw error;
    if (!data.url) throw new Error('Google login did not return an auth URL.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') throw new Error('Google login was cancelled.');

    const url = result.url;
    const hasFragment = url.includes('#access_token=');
    const hasCode = url.includes('?code=') || url.includes('&code=');

    if (hasFragment) {
      const params = new URLSearchParams(url.split('#')[1]);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) throw new Error('Missing tokens in redirect.');
      const { error: setError } = await supabase.auth.setSession({ access_token, refresh_token });
      if (setError) throw setError;
    } else if (hasCode) {
      const code = new URL(url).searchParams.get('code');
      if (!code) throw new Error('Google login did not return an auth code.');
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
    } else {
      throw new Error('Unrecognised redirect format.');
    }

    // ↓ only this part changed — no more user_metadata username logic
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user after login.');

    const p = await getProfile(user.id);
    setProfile(p);
    setMode('supabase');
    await AsyncStorage.setItem(GUEST_SESSION_KEY, 'false');

    // first time → no username → username-setup
    // returning user → has username → (tabs)
    if (!p?.username) {
      router.replace('/username-setup');
    } else {
      router.replace('/(tabs)');
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await Promise.all([
      AsyncStorage.removeItem(USERNAME_STORAGE_KEY),
      AsyncStorage.removeItem(GUEST_SESSION_KEY),
    ]);
    setSession(null);
    setMode(null);
    setUsername(null);
    router.replace('/welcome');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isSignedIn: Boolean(username && mode),
      mode,
      session,
      user: session?.user ?? null,
      username,
      signInWithGoogle,
      signOut
    }),
    [isReady, mode, session, signInWithGoogle, signOut, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}