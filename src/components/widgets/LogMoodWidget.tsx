import { usePalette } from '@/context/PaletteContext';
import { useEntries } from '@/context/EntriesContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { MOOD_MAP, MOODS, MoodId } from '@/theme/moods';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { MoodOrb, PressableScale, Widget } from './WidgetCard';

// Ported from moodlet/src/components/widgets/LogMoodWidget.tsx. Unlike
// moodlet's local-only `logMood()`, submit here calls the real
// Supabase-backed `useEntries().addEntry()` — this is a fast, supplementary
// quick-log entry point alongside the existing CheckInSheet flow, not a
// replacement for it.
export function LogMoodWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const { addEntry, entries } = useEntries();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [selected, setSelected] = useState<MoodId | null>(null);
    const [note, setNote] = useState('');
    const [justLogged, setJustLogged] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const mood = selected ? MOOD_MAP[selected] : null;
    const last = entries[0] ?? null;

    const pick = (id: MoodId) => {
        Haptics.selectionAsync();
        setSelected(id);
        setJustLogged(false);
    };

    const submit = async () => {
        if (!selected || submitting) return;
        setSubmitting(true);
        try {
            await addEntry({ mood: selected, activities: [], note: note.trim() || null });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setNote('');
            setSelected(null);
            setJustLogged(true);
        } catch (e) {
            Alert.alert('Could not log mood', e instanceof Error ? e.message : 'Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Widget
            colors={colors}
            styles={sharedStyles}
            kicker="Check in"
            title={mood ? `Feeling ${mood.label.toLowerCase()}` : "How's the vibe?"}
            tint={mood ? [mood.tintBg, mood.tintAccent] : [colors.primarySoft, colors.accent]}
        >
            <View style={styles.row}>
                {MOODS.map((m) => {
                    const active = m.id === selected;
                    const Icon = m.Icon;
                    return (
                        <PressableScale
                            key={m.id}
                            onPress={() => pick(m.id)}
                            scaleTo={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={m.label}
                        >
                            <View style={styles.orbWrap}>
                                {active ? (
                                    <MoodOrb mood={m} colors={colors} size={52} iconSize={22} />
                                ) : (
                                    <View
                                        style={[
                                            styles.orb,
                                            {
                                                backgroundColor: colors.surfaceWarm,
                                                borderColor: colors.border,
                                                borderWidth: 1,
                                                opacity: selected ? 0.5 : 1,
                                            },
                                        ]}
                                    >
                                        <Icon size={22} color={colors.muted} strokeWidth={2} />
                                    </View>
                                )}
                                <Text style={[styles.orbLabel, active && { color: m.tintAccent }]}>{m.label}</Text>
                            </View>
                        </PressableScale>
                    );
                })}
            </View>

            {selected && (
                <View style={styles.composer}>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="add a note… (optional)"
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                        maxLength={80}
                        returnKeyType="done"
                        editable={!submitting}
                        onSubmitEditing={submit}
                    />
                    <PressableScale onPress={submit} disabled={submitting}>
                        <View style={[styles.cta, submitting && { opacity: 0.6 }]}>
                            <Text style={styles.ctaText}>{submitting ? 'Logging…' : 'Log it'}</Text>
                        </View>
                    </PressableScale>
                </View>
            )}

            {!selected && (
                <Text style={sharedStyles.type.caption}>
                    {justLogged
                        ? 'Logged ✓ — nice check-in'
                        : last
                          ? `Last: ${MOOD_MAP[last.mood].label} · ${timeAgo(last.created_at)}`
                          : 'Tap a mood — takes 2 seconds'}
                </Text>
            )}
        </Widget>
    );
}

function timeAgo(iso: string) {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

const createStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        row: { flexDirection: 'row', justifyContent: 'space-between' },
        orbWrap: { alignItems: 'center', gap: 8, width: 56 },
        orb: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
        orbLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.muted },
        composer: { flexDirection: 'row', gap: 10, marginTop: 18, alignItems: 'center' },
        input: {
            flex: 1,
            height: 48,
            borderRadius: 999,
            paddingHorizontal: 18,
            backgroundColor: colors.surfaceWarm,
            color: colors.ink,
            fontFamily: fontFamily.regular,
            fontSize: 14,
        },
        cta: {
            height: 48,
            paddingHorizontal: 22,
            borderRadius: 999,
            backgroundColor: colors.primary,
            justifyContent: 'center',
        },
        ctaText: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.buttonText },
    });
