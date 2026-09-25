import { PressableScale } from '@/components/widgets/WidgetCard';
import { useCheckInSheet } from '@/context/CheckInSheetContext';
import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { ACTIVITIES, ActivityId } from '@/theme/activities';
import { fontFamily } from '@/theme/design';
import { MOOD_MAP, MOODS, MoodId } from '@/theme/moods';
import * as Haptics from 'expo-haptics';
import { LucideIcon, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { SheetModal } from '@/components/ui/sheet-modal';

type Step = 'mood' | 'activities' | 'notes';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function CheckInSheet() {
    const { isOpen, close } = useCheckInSheet();
    const { addEntry, patchEntry } = useEntries();
    const { colors } = usePalette();
    const reduceMotion = useReduceMotion();

    const [step, setStep] = useState<Step>('mood');
    const [mood, setMood] = useState<MoodId | null>(null);
    const [activities, setActivities] = useState<ActivityId[]>([]);
    const [note, setNote] = useState('');
    const [entryId, setEntryId] = useState<string | null>(null);
    const [isCreatingMood, setIsCreatingMood] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Invalidates any in-flight mood-creation continuation once the sheet is
    // reset (closed, or reopened) so a slow network response can't resurrect
    // stale state after the user has already moved on.
    const attemptRef = useRef(0);
    const fillProgress = useSharedValue(0);

    const reset = useCallback(() => {
        attemptRef.current += 1;
        setStep('mood');
        setMood(null);
        setActivities([]);
        setNote('');
        setEntryId(null);
        setIsCreatingMood(false);
        setIsFinalizing(false);
        fillProgress.value = 0;
    }, [fillProgress]);

    // Resets on open (not close) so the sheet's content doesn't jump back to
    // step one while it's still sliding away — see SheetModal, which keeps
    // this mounted through its own close animation.
    useEffect(() => {
        if (isOpen) reset();
    }, [isOpen, reset]);

    // Whatever activities/note the user has picked so far are persisted the
    // moment the sheet closes — by any path — so nothing typed is lost even
    // though every step past the mood tap is skippable.
    const persistDraft = useCallback(() => {
        if (!entryId) return;
        if (activities.length === 0 && note.trim().length === 0) return;
        patchEntry(entryId, { activities, note: note.trim() || null }).catch(() => {});
    }, [entryId, activities, note, patchEntry]);

    const handleClose = () => {
        persistDraft();
        close();
    };

    // docs/Moodlet_Design_Guide_v1.0.docx §2.2/§10.3 — a single mood tap is
    // itself a complete, valid entry. It saves immediately; everything after
    // is optional enrichment the user can back out of at any point.
    const handleSelectMood = async (id: MoodId) => {
        const token = ++attemptRef.current;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setMood(id);
        setIsCreatingMood(true);

        fillProgress.value = 0;
        if (!reduceMotion) {
            fillProgress.value = withTiming(0.85, { duration: 900 });
        }

        try {
            const entry = await addEntry({ mood: id, activities: [], note: null });
            if (attemptRef.current !== token) return;

            setEntryId(entry.id);
            fillProgress.value = reduceMotion ? 1 : withTiming(1, { duration: 150 });
            await wait(reduceMotion ? 0 : 180);
            if (attemptRef.current !== token) return;

            setStep('activities');
        } catch (e) {
            if (attemptRef.current !== token) return;
            Alert.alert('Could not save mood', e instanceof Error ? e.message : 'Try again.');
            setMood(null);
            fillProgress.value = 0;
        } finally {
            if (attemptRef.current === token) setIsCreatingMood(false);
        }
    };

    const toggleActivity = (id: ActivityId) => {
        Haptics.selectionAsync();
        setActivities((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
        );
    };

    const handleSave = async () => {
        if (!entryId) return;
        setIsFinalizing(true);
        try {
            await patchEntry(entryId, { activities, note: note.trim() || null });
            close();
        } catch (e) {
            Alert.alert('Could not save changes', e instanceof Error ? e.message : 'Try again.');
        } finally {
            setIsFinalizing(false);
        }
    };

    const fillStyle = useAnimatedStyle(() => ({
        width: `${fillProgress.value * 100}%`,
    }));

    const stepIndex = step === 'mood' ? 0 : step === 'activities' ? 1 : 2;
    const stepCount = 3;

    return (
        <SheetModal visible={isOpen} onRequestClose={handleClose} minHeight="60%" maxHeight="85%">
            <View style={styles.header}>
                <View style={styles.stepDots} accessibilityElementsHidden importantForAccessibility="no">
                    {(['mood', 'activities', 'notes'] as Step[]).map((s, i) => (
                        <View
                            key={s}
                            style={[
                                styles.stepDot,
                                { backgroundColor: i <= stepIndex ? colors.primary : colors.border },
                            ]}
                        />
                    ))}
                </View>
                <Text
                    accessibilityRole="text"
                    style={styles.srOnlyStepLabel}
                >{`Step ${stepIndex + 1} of ${stepCount}`}</Text>
                <Pressable
                    onPress={handleClose}
                    hitSlop={12}
                    accessibilityLabel="Close check-in"
                    accessibilityRole="button"
                >
                    <X size={22} color={colors.muted} />
                </Pressable>
            </View>

            {step === 'mood' && (
                <View style={styles.stepBody}>
                    <Text style={[styles.title, { color: colors.ink }]}>
                        How are you arriving right now?
                    </Text>
                    <View style={styles.moodGrid}>
                        {MOODS.map(({ id, label, tintBg, tintAccent, Icon }) => (
                            <MoodTile
                                key={id}
                                label={label}
                                tintBg={tintBg}
                                tintAccent={tintAccent}
                                Icon={Icon}
                                selected={mood === id}
                                reduceMotion={reduceMotion}
                                borderColor={colors.primary}
                                onPress={() => handleSelectMood(id)}
                            />
                        ))}
                    </View>
                    {mood && (
                        <View
                            style={[styles.fillTrack, { backgroundColor: colors.border }]}
                            accessibilityLabel={isCreatingMood ? 'Saving mood…' : undefined}
                        >
                            <Animated.View
                                style={[styles.fillBar, fillStyle, { backgroundColor: colors.primary }]}
                            />
                        </View>
                    )}
                </View>
            )}

            {step === 'activities' && mood && (
                <View style={styles.stepBody}>
                    <Text style={[styles.title, { color: colors.ink }]}>
                        Anything shaping that {MOOD_MAP[mood].label.toLowerCase()} feeling?
                    </Text>
                    <ScrollView contentContainerStyle={styles.activityWrap}>
                        {ACTIVITIES.map(({ id, label, Icon }) => {
                            const selected = activities.includes(id);
                            return (
                                <PressableScale
                                    key={id}
                                    scaleTo={0.94}
                                    onPress={() => toggleActivity(id)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={label}
                                    style={[
                                        styles.activityChip,
                                        {
                                            backgroundColor: selected ? colors.primarySoft : colors.surface,
                                            borderColor: selected ? colors.primary : colors.border,
                                        },
                                    ]}
                                >
                                    <Icon size={16} color={selected ? colors.primaryDark : colors.muted} />
                                    <Text
                                        style={[
                                            styles.activityLabel,
                                            { color: selected ? colors.primaryDark : colors.ink },
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </PressableScale>
                            );
                        })}
                    </ScrollView>
                    <View style={styles.footerRow}>
                        <Pressable onPress={handleClose} style={styles.skipButton}>
                            <Text style={[styles.skipText, { color: colors.muted }]}>Done for now</Text>
                        </Pressable>
                        <View style={styles.nextButtonWrap}>
                            <PressableScale
                                scaleTo={0.96}
                                onPress={() => setStep('notes')}
                                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                            >
                                <Text style={[styles.nextText, { color: colors.buttonText }]}>Next</Text>
                            </PressableScale>
                        </View>
                    </View>
                </View>
            )}

            {step === 'notes' && mood && (
                <View style={styles.stepBody}>
                    <Text style={[styles.title, { color: colors.ink }]}>
                        Want to say more? (optional)
                    </Text>
                    <Text style={[styles.inputLabel, { color: colors.softMuted }]}>Note</Text>
                    <View style={[styles.noteFrame, { borderColor: colors.border }]}>
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder="Write a few words…"
                            placeholderTextColor={colors.softMuted}
                            multiline
                            accessibilityLabel="Note"
                            style={[styles.noteInput, { color: colors.ink }]}
                        />
                    </View>
                    <Text style={[styles.hint, { color: colors.softMuted }]}>
                        Voice and photo notes are coming in a future update — text works for now.
                    </Text>
                    <View style={styles.saveButtonWrap}>
                        <PressableScale
                            scaleTo={0.97}
                            onPress={handleSave}
                            disabled={isFinalizing}
                            accessibilityRole="button"
                            style={[
                                styles.saveButton,
                                { backgroundColor: colors.primary, opacity: isFinalizing ? 0.6 : 1 },
                            ]}
                        >
                            <Text style={[styles.saveText, { color: colors.buttonText }]}>
                                {isFinalizing ? 'Saving…' : 'Save entry'}
                            </Text>
                        </PressableScale>
                    </View>
                </View>
            )}
        </SheetModal>
    );
}

// docs/Moodlet_Design_Guide_v1.0.docx §7.1 — selected state is a border plus
// a scale spring; skipped under reduce-motion. Kept subtle (1.05, damped) so
// the grid doesn't jump around as the user taps between moods.
function MoodTile({
    label,
    tintBg,
    tintAccent,
    Icon,
    selected,
    reduceMotion,
    borderColor,
    onPress,
}: {
    label: string;
    tintBg: string;
    tintAccent: string;
    Icon: LucideIcon;
    selected: boolean;
    reduceMotion: boolean;
    borderColor: string;
    onPress: () => void;
}) {
    const selectScale = useSharedValue(1);
    const pressScale = useSharedValue(1);

    useEffect(() => {
        selectScale.value = reduceMotion
            ? 1
            : withSpring(selected ? 1.05 : 1, { damping: 16, stiffness: 220 });
    }, [selected, reduceMotion, selectScale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: selectScale.value * pressScale.value }],
    }));

    return (
        <Animated.View style={[styles.moodTileWrap, animatedStyle]}>
            <Pressable
                onPress={onPress}
                onPressIn={() => {
                    pressScale.value = withSpring(0.93, { damping: 16, stiffness: 260 });
                }}
                onPressOut={() => {
                    pressScale.value = withSpring(1, { damping: 14, stiffness: 220 });
                }}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                style={[
                    styles.moodTile,
                    { backgroundColor: tintBg },
                    selected && {
                        borderColor,
                        borderWidth: 2,
                        shadowColor: tintAccent,
                        shadowOpacity: 0.3,
                        elevation: 4,
                    },
                ]}
            >
                <Icon size={26} color={tintAccent} strokeWidth={2} />
                <Text style={[styles.moodLabel, { color: tintAccent }]}>{label}</Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    stepDots: {
        flexDirection: 'row',
        gap: 6,
    },
    stepDot: {
        width: 20,
        height: 4,
        borderRadius: 2,
    },
    srOnlyStepLabel: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
    },
    stepBody: {
        flex: 1,
        gap: 16,
        paddingTop: 8,
    },
    title: {
        fontFamily: fontFamily.extraBold,
        fontSize: 20,
        lineHeight: 27,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    moodTileWrap: {
        width: '22%',
        aspectRatio: 1,
    },
    moodTile: {
        flex: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0,
        shadowRadius: 10,
    },
    moodLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: 11,
    },
    fillTrack: {
        height: 3,
        borderRadius: 2,
        overflow: 'hidden',
    },
    fillBar: {
        height: '100%',
    },
    activityWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 1.5,
    },
    activityLabel: {
        fontFamily: fontFamily.bold,
        fontSize: 13,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    skipButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    skipText: {
        fontFamily: fontFamily.bold,
        fontSize: 14,
    },
    nextButtonWrap: {
        flex: 1,
        marginLeft: 16,
    },
    nextButton: {
        minHeight: 52,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextText: {
        fontFamily: fontFamily.extraBold,
        fontSize: 15,
    },
    inputLabel: {
        fontFamily: fontFamily.bold,
        fontSize: 13,
        marginBottom: -8,
    },
    noteFrame: {
        borderWidth: 1.5,
        borderRadius: 12,
        minHeight: 110,
        padding: 14,
    },
    noteInput: {
        fontFamily: fontFamily.medium,
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
        textAlignVertical: 'top',
    },
    hint: {
        fontFamily: fontFamily.medium,
        fontSize: 12,
    },
    saveButtonWrap: {
        marginTop: 'auto',
    },
    saveButton: {
        minHeight: 56,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveText: {
        fontFamily: fontFamily.extraBold,
        fontSize: 16,
    },
});
