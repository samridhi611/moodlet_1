import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { createPaletteColors, fontFamily, PaletteColors } from '@/theme/design';

const moodOptions = ['Calm', 'Heavy', 'Hopeful', 'Tired'];

export default function HomeScreen() {
  const { mode, signOut, username } = useAuth();
  const { tokens } = usePalette();
  const colors = useMemo(() => createPaletteColors(tokens), [tokens]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.overline}>Today&apos;s check-in</Text>
            <Text style={styles.greeting}>Hi, {username}</Text>
            <Text style={styles.subtleText}>
              {mode === 'supabase' ? 'Your journal is connected to Google.' : 'You are journaling as a guest.'}
            </Text>
          </View>

          <Pressable onPress={signOut} style={({ pressed }) => [styles.signOutButton, pressed && styles.lightPress]}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        <View style={styles.promptPanel}>
          <View style={styles.promptAccent} />
          <Text style={styles.promptEyebrow}>Mood prompt</Text>
          <Text style={styles.promptTitle}>How are you arriving right now?</Text>
          <Text style={styles.promptCopy}>
            Notice the first honest word that comes up. The full journal editor comes next.
          </Text>

          <View style={styles.moodGrid}>
            {moodOptions.map((mood) => (
              <View key={mood} style={styles.moodPill}>
                <Text style={styles.moodText}>{mood}</Text>
              </View>
            ))}
          </View>

          <Pressable style={({ pressed }) => [styles.entryButton, pressed && styles.entryButtonPressed]}>
            <Text style={styles.entryButtonText}>Begin entry</Text>
          </Pressable>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Gentle setup complete</Text>
          <Text style={styles.noteCopy}>
            Username and auth are ready. Next we can add daily mood entries, streaks, and saved reflections.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: PaletteColors) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    container: {
      gap: 22,
      padding: 22,
      paddingTop: 28,
    },
    header: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 16,
      justifyContent: 'space-between',
    },
    headerCopy: {
      flex: 1,
      gap: 5,
    },
    overline: {
      color: colors.accentText,
      fontFamily: fontFamily.extraBold,
      fontSize: 12,
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
    greeting: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 32,
      letterSpacing: 0,
      lineHeight: 38,
    },
    subtleText: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 14,
      lineHeight: 20,
    },
    signOutButton: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    signOutText: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 13,
    },
    lightPress: {
      opacity: 0.72,
    },
    promptPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 12,
      overflow: 'hidden',
      padding: 20,
      shadowColor: colors.ink,
      shadowOffset: { height: 14, width: 0 },
      shadowOpacity: 0.09,
      shadowRadius: 24,
    },
    promptAccent: {
      backgroundColor: colors.blush,
      height: 7,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    promptEyebrow: {
      color: colors.accentText,
      fontFamily: fontFamily.extraBold,
      fontSize: 12,
      letterSpacing: 0,
      marginTop: 6,
      textTransform: 'uppercase',
    },
    promptTitle: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 30,
      letterSpacing: 0,
      lineHeight: 36,
    },
    promptCopy: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 15,
      lineHeight: 23,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingTop: 4,
    },
    moodPill: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    moodText: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 13,
    },
    entryButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      justifyContent: 'center',
      marginTop: 4,
      minHeight: 52,
    },
    entryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    entryButtonText: {
      color: colors.buttonText,
      fontFamily: fontFamily.bold,
      fontSize: 16,
    },
    noteCard: {
      backgroundColor: colors.surfaceWarm,
      borderRadius: 8,
      gap: 6,
      padding: 16,
    },
    noteTitle: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 16,
    },
    noteCopy: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 14,
      lineHeight: 21,
    },
  });
