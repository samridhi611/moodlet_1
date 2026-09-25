import { usePalette } from '@/context/PaletteContext';
import { fontFamily } from '@/theme/design';
import { MOOD_MAP } from '@/theme/moods';
import { Entry } from '@/types/entry';
import { buildYearGrid, PixelDay } from '@/utils/year-in-pixels';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const CELL = 10;
const GAP = 2;
const COLUMN_WIDTH = CELL + GAP;

const formatDayLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
};

export function YearInPixels({ year, entries }: { year: number; entries: Entry[] }) {
    const { colors } = usePalette();
    const [selected, setSelected] = useState<PixelDay | null>(null);

    const { weeks, monthLabels } = useMemo(() => buildYearGrid(year, entries), [year, entries]);

    const entriesByDate = useMemo(() => {
        const map = new Map<string, Entry[]>();
        entries.forEach((entry) => {
            const list = map.get(entry.entry_date) ?? [];
            list.push(entry);
            map.set(entry.entry_date, list);
        });
        return map;
    }, [entries]);

    const selectedEntries = selected ? entriesByDate.get(selected.date) ?? [] : [];

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <View style={styles.monthRow}>
                        {monthLabels.map(({ weekIndex, label }) => (
                            <Text
                                key={label}
                                style={[
                                    styles.monthLabel,
                                    { color: colors.softMuted, left: weekIndex * COLUMN_WIDTH },
                                ]}
                            >
                                {label}
                            </Text>
                        ))}
                    </View>
                    <View style={styles.grid}>
                        {weeks.map((week, wi) => (
                            <View key={wi} style={styles.column}>
                                {week.map((day) => {
                                    const mood = day.mood ? MOOD_MAP[day.mood] : null;
                                    const isSelected = selected?.date === day.date;
                                    return (
                                        <Pressable
                                            key={day.date}
                                            disabled={!day.inYear}
                                            onPress={() => setSelected(day)}
                                            accessibilityLabel={
                                                day.inYear
                                                    ? `${formatDayLabel(day.date)}, ${mood ? mood.label : 'no entry'}`
                                                    : undefined
                                            }
                                            style={[
                                                styles.cell,
                                                {
                                                    backgroundColor: mood
                                                        ? mood.tintAccent
                                                        : day.inYear
                                                          ? colors.border
                                                          : 'transparent',
                                                    opacity: day.inYear ? (mood ? 1 : 0.35) : 0,
                                                },
                                                isSelected && { borderWidth: 1.5, borderColor: colors.ink },
                                            ]}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {selected && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Text style={[styles.detailDate, { color: colors.ink }]}>{formatDayLabel(selected.date)}</Text>
                    {selectedEntries.length > 0 ? (
                        <>
                            <Text style={[styles.detailMood, { color: colors.accentText }]}>
                                {MOOD_MAP[selectedEntries[0].mood].label}
                                {selectedEntries.length > 1 ? ` · ${selectedEntries.length} check-ins` : ''}
                            </Text>
                            {selectedEntries[0].note && (
                                <Text style={[styles.detailNote, { color: colors.muted }]} numberOfLines={2}>
                                    {selectedEntries[0].note}
                                </Text>
                            )}
                        </>
                    ) : (
                        <Text style={[styles.detailMood, { color: colors.muted }]}>No check-in this day</Text>
                    )}
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    monthRow: {
        height: 16,
        position: 'relative',
    },
    monthLabel: {
        position: 'absolute',
        top: 0,
        fontFamily: fontFamily.semiBold,
        fontSize: 11,
    },
    grid: {
        flexDirection: 'row',
        gap: GAP,
    },
    column: {
        gap: GAP,
    },
    cell: {
        width: CELL,
        height: CELL,
        borderRadius: 2,
    },
    detailCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 4,
    },
    detailDate: {
        fontFamily: fontFamily.bold,
        fontSize: 13,
    },
    detailMood: {
        fontFamily: fontFamily.extraBold,
        fontSize: 15,
    },
    detailNote: {
        fontFamily: fontFamily.medium,
        fontStyle: 'italic',
        fontSize: 12,
        lineHeight: 17,
    },
});
