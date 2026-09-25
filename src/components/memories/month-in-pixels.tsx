import { usePalette } from '@/context/PaletteContext';
import { fontFamily } from '@/theme/design';
import { MOOD_MAP } from '@/theme/moods';
import { Entry } from '@/types/entry';
import { buildMonthGrid, MonthPixelDay, WEEKDAY_LABELS } from '@/utils/month-in-pixels';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const formatDayLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
};

export function MonthInPixels({ year, month, entries }: { year: number; month: number; entries: Entry[] }) {
    const { colors } = usePalette();
    const [selected, setSelected] = useState<MonthPixelDay | null>(null);

    const weeks = useMemo(() => buildMonthGrid(year, month, entries), [year, month, entries]);

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
            <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((label, i) => (
                    <Text key={`${label}-${i}`} style={[styles.weekdayLabel, { color: colors.softMuted }]}>
                        {label}
                    </Text>
                ))}
            </View>
            <View style={styles.grid}>
                {weeks.map((week, wi) => (
                    <View key={wi} style={styles.weekRow}>
                        {week.map((dayItem) => {
                            const mood = dayItem.mood ? MOOD_MAP[dayItem.mood] : null;
                            const isSelected = selected?.date === dayItem.date;
                            return (
                                <Pressable
                                    key={dayItem.date}
                                    disabled={!dayItem.inMonth}
                                    onPress={() => setSelected(dayItem)}
                                    accessibilityLabel={
                                        dayItem.inMonth
                                            ? `${formatDayLabel(dayItem.date)}, ${mood ? mood.label : 'no entry'}`
                                            : undefined
                                    }
                                    style={styles.cellWrap}
                                >
                                    <View
                                        style={[
                                            styles.cell,
                                            {
                                                backgroundColor: mood
                                                    ? mood.tintAccent
                                                    : dayItem.inMonth
                                                      ? colors.border
                                                      : 'transparent',
                                                opacity: dayItem.inMonth ? (mood ? 1 : 0.35) : 0,
                                            },
                                            isSelected && { borderWidth: 1.5, borderColor: colors.ink },
                                        ]}
                                    >
                                        {dayItem.inMonth && (
                                            <Text
                                                style={[
                                                    styles.dayNumber,
                                                    { color: mood ? mood.tintBg : colors.softMuted },
                                                ]}
                                            >
                                                {dayItem.day}
                                            </Text>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
            </View>

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
    weekdayRow: {
        flexDirection: 'row',
    },
    weekdayLabel: {
        flex: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: 11,
        textAlign: 'center',
    },
    grid: {
        gap: 6,
    },
    weekRow: {
        flexDirection: 'row',
        gap: 6,
    },
    cellWrap: {
        flex: 1,
        aspectRatio: 1,
    },
    cell: {
        flex: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumber: {
        fontFamily: fontFamily.bold,
        fontSize: 12,
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
