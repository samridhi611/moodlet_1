import { EntryCard } from '@/components/entry/entry-card';
import { FriendsMoodWidget } from '@/components/widgets/FriendsMoodWidget';
import { HourlyMoodWidget } from '@/components/widgets/HourlyMoodWidget';
import { LogMoodWidget } from '@/components/widgets/LogMoodWidget';
import { StreakWidget, TodayWidget, WeekWidget } from '@/components/widgets/MiniWidgets';
import { useCheckInSheet } from '@/context/CheckInSheetContext';
import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { usePressState } from '@/hooks/use-press-state';
import { useProfile } from '@/context/ProfileContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { Flame } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { username } = useProfile();
  const { colors } = usePalette();
  const { entries, todayEntry, streak, isLoading, refresh } = useEntries();
  const { open: openCheckIn } = useCheckInSheet();
  const logAnother = usePressState();
  const beginCheckIn = usePressState();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const recentEntries = todayEntry ? entries.slice(1, 11) : entries.slice(0, 10);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.overline}>Today&apos;s check-in</Text>
            <Text style={styles.greeting}>Hi, {username ?? 'there'}</Text>
          </View>

          {streak > 0 && (
            <View
              style={styles.streakBadge}
              accessible
              accessibilityLabel={`${streak} day streak`}
            >
              <Flame size={16} color={colors.primaryDark} strokeWidth={2.3} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
        </View>

        <View style={styles.widgetsSection}>
          <View style={styles.widgetsRow}>
            <StreakWidget />
            <TodayWidget />
          </View>
          {/* <View style={styles.widgetsRow}>
            <TopMoodWidget />
            <DaysLoggedWidget />
          </View> */}
          <WeekWidget />
          <FriendsMoodWidget />
          <HourlyMoodWidget />
          <LogMoodWidget />
        </View>

        {todayEntry ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            <EntryCard entry={todayEntry} />
            <Pressable
              onPress={openCheckIn}
              {...logAnother.handlers}
              style={[styles.secondaryButton, logAnother.pressed && styles.lightPress]}
            >
              <Text style={styles.secondaryButtonText}>Log another moment</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.promptPanel}>
            <Text style={styles.promptEyebrow}>Mood prompt</Text>
            <Text style={styles.promptTitle}>How are you arriving right now?</Text>
            <Text style={styles.promptCopy}>
              Notice the first honest word that comes up. One tap is all it takes.
            </Text>
            <Pressable
              onPress={openCheckIn}
              {...beginCheckIn.handlers}
              style={[styles.entryButton, beginCheckIn.pressed && styles.entryButtonPressed]}
            >
              <Text style={styles.entryButtonText}>Begin check-in</Text>
            </Pressable>
          </View>
        )}

        {recentEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent check-ins</Text>
            <View style={styles.entryList}>
              {recentEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </View>
          </View>
        )}
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
      paddingBottom: 140,
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
    widgetsSection: {
      gap: 16,
    },
    widgetsRow: {
      flexDirection: 'row',
      gap: 16,
    },
    overline: {
      color: colors.accentText,
      fontFamily: fontFamily.extraBold,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    greeting: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 32,
      lineHeight: 38,
    },
    streakBadge: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 999,
      flexDirection: 'row',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    streakText: {
      color: colors.primaryDark,
      fontFamily: fontFamily.extraBold,
      fontSize: 14,
    },
    promptPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      gap: 12,
      padding: 20,
    },
    promptEyebrow: {
      color: colors.accentText,
      fontFamily: fontFamily.extraBold,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    promptTitle: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 26,
      lineHeight: 32,
    },
    promptCopy: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 15,
      lineHeight: 23,
    },
    entryButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 999,
      justifyContent: 'center',
      marginTop: 4,
      minHeight: 52,
    },
    entryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    entryButtonText: {
      color: colors.buttonText,
      fontFamily: fontFamily.extraBold,
      fontSize: 16,
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 16,
    },
    entryList: {
      gap: 10,
    },
    secondaryButton: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1.5,
      justifyContent: 'center',
      minHeight: 48,
    },
    lightPress: {
      opacity: 0.72,
    },
    secondaryButtonText: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 14,
    },
  });
