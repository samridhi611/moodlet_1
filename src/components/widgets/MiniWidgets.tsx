import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { MOOD_MAP, MOODS, MoodId } from '@/theme/moods';
import { toDateString } from '@/utils/date';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MoodOrb, Widget } from './WidgetCard';

// Ported from moodlet/src/components/widgets/MiniWidgets.tsx, but improved
// per the plan: StreakWidget/TodayWidget read real data straight from
// useEntries() (`streak`/`todayEntry`) instead of recomputing locally from a
// separate local store, and WeekWidget's mood-wave computes directly from
// `entries` (already one-per-day-ish granularity) using the new `score`
// field on moods.ts. TopMoodWidget/DaysLoggedWidget are new square tiles
// (not in moodlet) added to round the dashboard into a full 2x2 grid.

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
                    <MoodOrb mood={mood} colors={colors} size={52} iconSize={26} />
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
        <Widget
            colors={colors}
            styles={sharedStyles}
            kicker="This week"
            title="Your mood wave"
            tint={[colors.primarySoft, colors.accent]}
        >
            <View style={styles.week}>
                {days.map((day, i) => {
                    return (
                        <View key={i} style={styles.dayCol}>
                            {day.mood ? (
                                <MoodOrb mood={day.mood} colors={colors} size={38} iconSize={18} />
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

/** Most-logged mood over the last 7 days. */
export function TopMoodWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const { entries } = useEntries();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const top = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 6);
        const cutoffStr = toDateString(cutoff);

        const counts = new Map<MoodId, number>();
        for (const e of entries) {
            if (e.entry_date < cutoffStr) continue;
            counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
        }

        let bestId: MoodId | null = null;
        let bestCount = 0;
        for (const [id, count] of counts) {
            if (count > bestCount) {
                bestId = id;
                bestCount = count;
            }
        }
        return bestId ? { mood: MOOD_MAP[bestId], count: bestCount } : null;
    }, [entries]);

    return (
        <Widget
            colors={colors}
            styles={sharedStyles}
            style={styles.half}
            tint={top ? [top.mood.tintBg, top.mood.tintAccent] : [colors.primarySoft, colors.accent]}
        >
            <Text style={sharedStyles.type.kicker}>This week</Text>
            {top ? (
                <View style={styles.todayRow}>
                    <MoodOrb mood={top.mood} colors={colors} size={52} iconSize={26} />
                    <Text style={[styles.todayLabel, { color: top.mood.tintAccent }]}>{top.mood.label}</Text>
                </View>
            ) : (
                <View style={styles.todayRow}>
                    <Text style={styles.notLogged}>—</Text>
                    <Text style={sharedStyles.type.caption}>No check-ins yet</Text>
                </View>
            )}
        </Widget>
    );
}

/** Total entries ever logged — the "all time" counterpart to the day-streak tile. */
export function DaysLoggedWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const { entries } = useEntries();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Widget colors={colors} styles={sharedStyles} style={styles.half} tint={[colors.primarySoft, colors.accent]}>
            <Text style={sharedStyles.type.kicker}>All time</Text>
            <View style={styles.bigRow}>
                <Text style={styles.big}>{entries.length}</Text>
                <Text style={styles.fire}>📅</Text>
            </View>
            <Text style={sharedStyles.type.caption}>{entries.length === 1 ? 'day logged' : 'days logged'}</Text>
        </Widget>
    );
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
