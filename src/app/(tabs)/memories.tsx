import { YearInPixels } from '@/components/memories/year-in-pixels';
import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { MOOD_MAP, MoodId } from '@/theme/moods';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MemoriesScreen() {
  const { colors } = usePalette();
  const { entries } = useEntries();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const styles = useMemo(() => createStyles(colors), [colors]);

  const yearEntries = useMemo(
    () => entries.filter((entry) => entry.entry_date.startsWith(String(year))),
    [entries, year],
  );

  const topMood = useMemo(() => {
    if (yearEntries.length === 0) return null;
    const counts = new Map<MoodId, number>();
    yearEntries.forEach((entry) => counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1));
    const [id] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return id;
  }, [yearEntries]);

  const canGoForward = year < new Date().getFullYear();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.overline}>Memories</Text>
          <Text style={styles.title}>Year in pixels</Text>
        </View>

        <View style={styles.yearSwitcher}>
          <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={10} accessibilityLabel="Previous year">
            <ChevronLeft size={20} color={colors.ink} />
          </Pressable>
          <Text style={styles.yearLabel}>{year}</Text>
          <Pressable
            onPress={() => canGoForward && setYear((y) => y + 1)}
            hitSlop={10}
            disabled={!canGoForward}
            accessibilityLabel="Next year"
          >
            <ChevronRight size={20} color={canGoForward ? colors.ink : colors.border} />
          </Pressable>
        </View>

        <YearInPixels year={year} entries={entries} />

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statValue}>{yearEntries.length}</Text>
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
