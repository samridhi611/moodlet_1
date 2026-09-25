import { usePalette } from '@/context/PaletteContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { MOOD_MAP, MOODS, MoodId } from '@/theme/moods';
import { applyHour, dateKey, HourMap, loadHours, saveHours } from '@/widgets/hours-store';
import { syncHoursWidget } from '@/widgets/sync';
import { hourWidgetProps } from '@/widgets/widget-data';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip, MoodOrb, PressableScale, Widget } from './WidgetCard';

const COL_W = 34;
const COL_GAP = 8;
const BAR_MAX = 96;

// Ported from moodlet/src/components/widgets/HourlyMoodWidget.tsx. Backed by
// src/widgets/hours-store.ts — the same local-only AsyncStorage state the
// headless native HourlyMood widget reads/writes — so an hour logged here
// shows up on the placed widget and vice versa. Every write also calls
// syncHoursWidget() to push the refreshed cache + colors to any placed widget.
export function HourlyMoodWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [todayHours, setTodayHours] = useState<HourMap>({});
    const [editing, setEditing] = useState<number | null>(null);
    const scrollRef = useRef<ScrollView>(null);
    const nowHour = new Date().getHours();

    useEffect(() => {
        loadHours().then((state) => setTodayHours(state[dateKey()] ?? {}));
    }, []);

    useEffect(() => {
        // Start scrolled so the current hour is in view.
        const x = Math.max(0, (nowHour - 5) * (COL_W + COL_GAP));
        const t = setTimeout(() => scrollRef.current?.scrollTo({ x, animated: false }), 50);
        return () => clearTimeout(t);
    }, [nowHour]);

    const setHourMood = async (hour: number, mood: MoodId | null) => {
        const state = await loadHours();
        const next = applyHour(state, hour, mood);
        await saveHours(next);
        setTodayHours(next[dateKey()] ?? {});
        if (Platform.OS === 'android') {
            hourWidgetProps().then(syncHoursWidget).catch(() => {});
        }
    };

    const logged = Object.values(todayHours);
    const avgScore = logged.length
        ? logged.reduce((sum, id) => sum + MOOD_MAP[id].score, 0) / logged.length
        : null;
    const avgMood = avgScore !== null ? moodForScore(avgScore) : null;

    return (
        <Widget
            colors={colors}
            styles={sharedStyles}
            kicker="Today, hour by hour"
            title="Mood timeline"
            right={avgMood ? <Chip label={`avg ${avgMood.label}`} color={avgMood.tintAccent} colors={colors} /> : undefined}
            tint={avgMood ? [avgMood.tintBg, avgMood.tintAccent] : [colors.primarySoft, colors.accent]}
        >
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollOuter}
                contentContainerStyle={styles.scrollInner}
            >
                {Array.from({ length: 24 }, (_, h) => {
                    const moodId = todayHours[h];
                    const mood = moodId ? MOOD_MAP[moodId] : null;
                    const MoodIcon = mood?.Icon;
                    const future = h > nowHour;
                    const isEditing = editing === h;
                    return (
                        <PressableScale
                            key={h}
                            disabled={future}
                            scaleTo={0.9}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setEditing(isEditing ? null : h);
                            }}
                            accessibilityLabel={`${formatHour(h)}${mood ? `, ${mood.label}` : ', empty'}`}
                        >
                            <View style={[styles.col, future && { opacity: 0.25 }]}>
                                <View style={[styles.track, isEditing && styles.trackActive]}>
                                    {mood && MoodIcon ? (
                                        <LinearGradient
                                            colors={[mood.tintAccent, mood.tintBg]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            style={[styles.bar, { height: 26 + (mood.score / 8) * (BAR_MAX - 26) }]}
                                        >
                                            <View style={styles.barBadge}>
                                                <MoodIcon size={12} color={mood.tintAccent} strokeWidth={2.4} />
                                            </View>
                                        </LinearGradient>
                                    ) : (
                                        !future && <Text style={styles.plus}>+</Text>
                                    )}
                                </View>
                                <Text style={[styles.hour, h === nowHour && styles.hourNow]}>
                                    {h === nowHour ? 'now' : formatHour(h)}
                                </Text>
                            </View>
                        </PressableScale>
                    );
                })}
            </ScrollView>

            {editing !== null && (
                <View style={styles.picker}>
                    <Text style={sharedStyles.type.caption}>{formatHour(editing, true)}</Text>
                    <View style={styles.pickerRow}>
                        {MOODS.map((m) => {
                            const active = todayHours[editing] === m.id;
                            const Icon = m.Icon;
                            return (
                                <PressableScale
                                    key={m.id}
                                    scaleTo={0.8}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setHourMood(editing, m.id);
                                        setEditing(null);
                                    }}
                                >
                                    {active ? (
                                        <MoodOrb mood={m} colors={colors} size={44} iconSize={20} />
                                    ) : (
                                        <View style={styles.pick}>
                                            <Icon size={20} color={colors.muted} strokeWidth={2} />
                                        </View>
                                    )}
                                </PressableScale>
                            );
                        })}
                        {todayHours[editing] && (
                            <PressableScale
                                onPress={() => {
                                    setHourMood(editing, null);
                                    setEditing(null);
                                }}
                            >
                                <View style={styles.pick}>
                                    <Text style={styles.clear}>✕</Text>
                                </View>
                            </PressableScale>
                        )}
                    </View>
                </View>
            )}
        </Widget>
    );
}

function formatHour(h: number, long = false) {
    const suffix = h < 12 ? 'am' : 'pm';
    const n = h % 12 === 0 ? 12 : h % 12;
    return long ? `${n}:00 ${suffix}` : `${n}${suffix}`;
}

// Finds the mood whose score is closest to a (possibly fractional) average score.
function moodForScore(score: number) {
    const rounded = Math.min(8, Math.max(1, Math.round(score)));
    return MOODS.find((m) => m.score === rounded) ?? MOODS[0];
}

const createStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        scrollOuter: { marginHorizontal: -18 },
        scrollInner: { paddingHorizontal: 18, gap: COL_GAP },
        col: { width: COL_W, alignItems: 'center', gap: 8 },
        track: {
            width: COL_W,
            height: BAR_MAX,
            borderRadius: 10,
            backgroundColor: colors.surfaceWarm,
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        trackActive: { borderWidth: 1.5, borderColor: colors.primary },
        bar: { width: '100%', borderRadius: 10, alignItems: 'center' },
        barBadge: {
            position: 'absolute',
            top: -10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        plus: { color: colors.muted, fontSize: 18, marginBottom: 36, fontFamily: fontFamily.regular },
        hour: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.muted },
        hourNow: { color: colors.primaryDark, fontFamily: fontFamily.semiBold },
        picker: { marginTop: 16, padding: 12, borderRadius: 18, backgroundColor: colors.surfaceWarm, gap: 10 },
        pickerRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
        pick: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        clear: { color: colors.muted, fontSize: 16 },
    });
