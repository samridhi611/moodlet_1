import { MonthInPixels } from '@/components/memories/month-in-pixels';
import { YearInPixels } from '@/components/memories/year-in-pixels';
import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { MOOD_MAP, MoodId } from '@/theme/moods';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MemoriesView = 'monthly' | 'yearly';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MemoriesScreen() {
  const { colors } = usePalette();
  const { entries } = useEntries();
  const now = useMemo(() => new Date(), []);
  const [view, setView] = useState<MemoriesView>('monthly');
  const [year, setYear] = useState(() => now.getFullYear());
  const [month, setMonth] = useState(() => now.getMonth());
  const styles = useMemo(() => createStyles(colors), [colors]);

  const periodEntries = useMemo(() => {
    if (view === 'yearly') {
      return entries.filter((entry) => entry.entry_date.startsWith(String(year)));
    }
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return entries.filter((entry) => entry.entry_date.startsWith(prefix));
  }, [entries, year, month, view]);

  const topMood = useMemo(() => {
    if (periodEntries.length === 0) return null;
    const counts = new Map<MoodId, number>();
    periodEntries.forEach((entry) => counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1));
    const [id] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return id;
  }, [periodEntries]);

  const canGoForwardYear = year < now.getFullYear();
  const canGoForwardMonth = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth());

  const goToPrevMonth = () => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goToNextMonth = () => {
    if (!canGoForwardMonth) return;
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.overline}>Memories</Text>
          <Text style={styles.title}>{view === 'monthly' ? 'Month in pixels' : 'Year in pixels'}</Text>
        </View>

        <View style={[styles.viewSwitcher, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(['monthly', 'yearly'] as MemoriesView[]).map((option) => {
            const selected = view === option;
            return (
              <Pressable
                key={option}
                onPress={() => setView(option)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.viewOption,
                  selected && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.viewOptionText,
                    { color: selected ? colors.buttonText : colors.muted },
                  ]}
                >
                  {option === 'monthly' ? 'Monthly' : 'Yearly'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {view === 'monthly' ? (
          <View style={styles.yearSwitcher}>
            <Pressable onPress={goToPrevMonth} hitSlop={10} accessibilityLabel="Previous month">
              <ChevronLeft size={20} color={colors.ink} />
            </Pressable>
            <Text style={styles.yearLabel}>{`${MONTH_NAMES[month]} ${year}`}</Text>
            <Pressable
              onPress={goToNextMonth}
              hitSlop={10}
              disabled={!canGoForwardMonth}
              accessibilityLabel="Next month"
            >
              <ChevronRight size={20} color={canGoForwardMonth ? colors.ink : colors.border} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.yearSwitcher}>
            <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={10} accessibilityLabel="Previous year">
              <ChevronLeft size={20} color={colors.ink} />
            </Pressable>
            <Text style={styles.yearLabel}>{year}</Text>
            <Pressable
              onPress={() => canGoForwardYear && setYear((y) => y + 1)}
              hitSlop={10}
              disabled={!canGoForwardYear}
              accessibilityLabel="Next year"
            >
              <ChevronRight size={20} color={canGoForwardYear ? colors.ink : colors.border} />
            </Pressable>
          </View>
        )}

        {view === 'monthly' ? (
          <MonthInPixels year={year} month={month} entries={entries} />
        ) : (
          <YearInPixels year={year} entries={entries} />
        )}

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statValue}>{periodEntries.length}</Text>
            <Text style={styles.statLabel}>check-ins</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statValue}>{topMood ? MOOD_MAP[topMood].label : '—'}</Text>
            <Text style={styles.statLabel}>most common mood</Text>
          </View>
        </View>

        <Text style={styles.hint}>
          Only entries from the last 12 months are loaded, so earlier years may look sparse.
        </Text>
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
      gap: 20,
      padding: 22,
      paddingTop: 28,
      paddingBottom: 140,
    },
    header: {
      gap: 5,
    },
    overline: {
      color: colors.accentText,
      fontFamily: fontFamily.extraBold,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    title: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 28,
      lineHeight: 34,
    },
    viewSwitcher: {
      flexDirection: 'row',
      alignSelf: 'center',
      borderRadius: 999,
      borderWidth: 1,
      padding: 3,
      gap: 2,
    },
    viewOption: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 999,
    },
    viewOptionText: {
      fontFamily: fontFamily.bold,
      fontSize: 13,
    },
    yearSwitcher: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
    },
    yearLabel: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 16,
      minWidth: 48,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      gap: 4,
      alignItems: 'center',
    },
    statValue: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 20,
    },
    statLabel: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 12,
    },
    hint: {
      color: colors.softMuted,
      fontFamily: fontFamily.medium,
      fontSize: 12,
      textAlign: 'center',
    },
  });
