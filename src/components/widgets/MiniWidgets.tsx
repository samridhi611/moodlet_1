import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { MOOD_MAP, MOODS, MoodId } from '@/theme/moods';
import { toDateString } from '@/utils/date';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Widget } from './WidgetCard';

// Ported from moodlet/src/components/widgets/MiniWidgets.tsx, but improved
// per the plan: StreakWidget/TodayWidget read real data straight from
// useEntries() (`streak`/`todayEntry`) instead of recomputing locally from a
// separate local store, and WeekWidget's mood-wave computes directly from
// `entries` (already one-per-day-ish granularity) using the new `score`
// field on moods.ts.

export function StreakWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const { streak } = useEntries();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Widget colors={colors} styles={sharedStyles} style={styles.half} tint={['#FFD37A', '#FF9F5A']}>
            <Text style={sharedStyles.type.kicker}>Streak</Text>
            <View style={styles.bigRow}>
                <Text style={styles.big}>{streak}</Text>
                <Text style={styles.fire}>🔥</Text>
            </View>
            <Text style={sharedStyles.type.caption}>{streak === 1 ? 'day' : 'days'} in a row</Text>
        </Widget>
    );
}

// moodlet_1's entries model isn't a numeric "check-ins vs goal" count — a
// day either has a logged mood or it doesn't — so this shows today's mood
// (or a "not logged yet" state) rather than moodlet's count-vs-goal bar.
export function TodayWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const { todayEntry } = useEntries();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const mood = todayEntry ? MOOD_MAP[todayEntry.mood] : null;
    const MoodIcon = mood?.Icon;

    return (
        <Widget
            colors={colors}
            styles={sharedStyles}
            style={styles.half}
            tint={mood ? [mood.tintBg, mood.tintAccent] : ['#D7F49A', '#8FD9A8']}
        >
            <Text style={sharedStyles.type.kicker}>Today</Text>
            {mood && MoodIcon ? (
                <View style={styles.todayRow}>
                    <View style={[styles.todayIcon, { backgroundColor: mood.tintBg }]}>
                        <MoodIcon size={26} color={mood.tintAccent} strokeWidth={2.2} />
                    </View>
                    <Text style={[styles.todayLabel, { color: mood.tintAccent }]}>{mood.label}</Text>
                </View>
            ) : (
                <View style={styles.todayRow}>
                    <Text style={styles.notLogged}>—</Text>
                    <Text style={sharedStyles.type.caption}>Not logged yet</Text>
                </View>
            )}
        </Widget>
    );
}

export function WeekWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const { entries } = useEntries();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const byDate = useMemo(() => {
        const map: Record<string, MoodId[]> = {};
        for (const e of entries) (map[e.entry_date] ??= []).push(e.mood);
        return map;
    }, [entries]);

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const moods = byDate[toDateString(d)] ?? [];
        const avg = moods.length ? moods.reduce((sum, id) => sum + MOOD_MAP[id].score, 0) / moods.length : null;
        return {
            label: d.toLocaleDateString('en', { weekday: 'narrow' }),
            mood: avg !== null ? moodForScore(avg) : null,
            today: i === 6,
        };
    });

    return (
        <Widget colors={colors} styles={sharedStyles} kicker="This week" title="Your mood wave">
            <View style={styles.week}>
                {days.map((day, i) => {
                    const DayIcon = day.mood?.Icon;
                    return (
                        <View key={i} style={styles.dayCol}>
                            {day.mood && DayIcon ? (
                                <View
                                    style={[
                                        styles.dayDot,
                                        { backgroundColor: day.mood.tintBg, borderColor: day.mood.tintAccent, borderWidth: 1.5 },
                                    ]}
                                >
                                    <DayIcon size={18} color={day.mood.tintAccent} strokeWidth={2.2} />
                                </View>
                            ) : (
                                <View style={[styles.dayDot, styles.dayEmpty]} />
                            )}
                            <Text style={[styles.dayLabel, day.today && { color: colors.primaryDark, fontFamily: fontFamily.bold }]}>
                                {day.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </Widget>
    );
}

// Finds the mood whose score is closest to a (possibly fractional) average score.
function moodForScore(score: number) {
    const rounded = Math.min(8, Math.max(1, Math.round(score)));
    return MOODS.find((m) => m.score === rounded) ?? MOODS[0];
}

const createStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        half: { flex: 1, minHeight: 150, justifyContent: 'space-between' },
        bigRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
        big: { fontFamily: fontFamily.extraBold, fontSize: 52, lineHeight: 56, color: colors.ink, letterSpacing: -2 },
        fire: { fontSize: 26, marginBottom: 6 },
        todayRow: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', gap: 10 },
        todayIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
        todayLabel: { fontFamily: fontFamily.extraBold, fontSize: 18 },
        notLogged: { fontFamily: fontFamily.extraBold, fontSize: 40, color: colors.softMuted, marginTop: 8 },
        week: { flexDirection: 'row', justifyContent: 'space-between' },
        dayCol: { alignItems: 'center', gap: 8 },
        dayDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
        dayEmpty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border },
        dayLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.muted },
    });
