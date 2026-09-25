import { PressableScale } from '@/components/widgets/WidgetCard';
import { useEditEntry } from '@/context/EditEntryContext';
import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { ACTIVITIES, ActivityId } from '@/theme/activities';
import { fontFamily } from '@/theme/design';
import { MOODS, MoodId } from '@/theme/moods';
import { Entry } from '@/types/entry';
import * as Haptics from 'expo-haptics';
import { Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SheetModal } from '@/components/ui/sheet-modal';

export function EditEntrySheet() {
    const { entry, close } = useEditEntry();
    const { patchEntry, removeEntry } = useEntries();
    const { colors } = usePalette();

    const [mood, setMood] = useState<MoodId | null>(null);
    const [activities, setActivities] = useState<ActivityId[]>([]);
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // `entry` goes back to null the instant `close()` fires — hang on to the
    // last one so the form still has something to render while SheetModal
    // plays its close animation instead of the sheet snapping empty.
    const [displayEntry, setDisplayEntry] = useState<Entry | null>(null);

    useEffect(() => {
        if (!entry) return;
        setDisplayEntry(entry);
        setMood(entry.mood);
        setActivities(entry.activities);
        setNote(entry.note ?? '');
    }, [entry]);

    if (!displayEntry) return null;

    const toggleActivity = (id: ActivityId) => {
        Haptics.selectionAsync();
        setActivities((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
    };

    const handleSave = async () => {
        if (!mood) return;
        setIsSaving(true);
        try {
            await patchEntry(displayEntry.id, { mood, activities, note: note.trim() || null });
            close();
        } catch (e) {
            Alert.alert('Could not save changes', e instanceof Error ? e.message : 'Try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete this entry?', 'This can’t be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    setIsDeleting(true);
                    try {
                        await removeEntry(displayEntry.id);
                        close();
                    } catch (e) {
                        Alert.alert('Could not delete entry', e instanceof Error ? e.message : 'Try again.');
                        setIsDeleting(false);
                    }
                },
            },
        ]);
    };

    return (
        <SheetModal visible={!!entry} onRequestClose={close} minHeight="55%" maxHeight="88%">
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.ink }]}>Edit entry</Text>
                <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                    <X size={22} color={colors.muted} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body}>
                <Text style={[styles.inputLabel, { color: colors.softMuted }]}>Mood</Text>
                <View style={styles.moodRow}>
                    {MOODS.map(({ id, label, tintBg, tintAccent, Icon }) => {
                        const selected = mood === id;
                        return (
                            <PressableScale
                                key={id}
                                scaleTo={0.94}
                                onPress={() => setMood(id)}
                                accessibilityRole="button"
                                accessibilityLabel={label}
                                accessibilityState={{ selected }}
                                style={[
                                    styles.moodChip,
                                    { backgroundColor: tintBg },
                                    selected && { borderColor: colors.primary, borderWidth: 2 },
                                ]}
                            >
                                <Icon size={20} color={tintAccent} strokeWidth={2} />
                                <Text style={[styles.moodChipLabel, { color: tintAccent }]}>{label}</Text>
                            </PressableScale>
                        );
                    })}
                </View>

                <Text style={[styles.inputLabel, { color: colors.softMuted }]}>Activities</Text>
                <View style={styles.activityWrap}>
                    {ACTIVITIES.map(({ id, label, Icon }) => {
                        const selected = activities.includes(id);
                        return (
                            <PressableScale
                                key={id}
                                scaleTo={0.94}
                                onPress={() => toggleActivity(id)}
                                accessibilityRole="button"
                                accessibilityLabel={label}
                                accessibilityState={{ selected }}
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
                </View>

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
            </ScrollView>

            <View style={styles.footer}>
                <PressableScale
                    scaleTo={0.95}
                    onPress={handleDelete}
                    disabled={isDeleting}
                    accessibilityRole="button"
                    accessibilityLabel="Delete entry"
                    style={[styles.deleteButton, { borderColor: colors.error }]}
                >
                    <Trash2 size={16} color={colors.error} strokeWidth={2} />
                    <Text style={[styles.deleteText, { color: colors.error }]}>
                        {isDeleting ? 'Deleting…' : 'Delete'}
                    </Text>
                </PressableScale>
                <View style={styles.saveButtonWrap}>
                    <PressableScale
                        scaleTo={0.97}
                        onPress={handleSave}
                        disabled={isSaving || !mood}
                        accessibilityRole="button"
                        style={[
                            styles.saveButton,
                            { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 },
                        ]}
                    >
                        <Text style={[styles.saveText, { color: colors.buttonText }]}>
                            {isSaving ? 'Saving…' : 'Save changes'}
                        </Text>
                    </PressableScale>
                </View>
            </View>
        </SheetModal>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontFamily: fontFamily.extraBold,
        fontSize: 18,
    },
    body: {
        gap: 10,
        paddingBottom: 12,
    },
    inputLabel: {
        fontFamily: fontFamily.bold,
        fontSize: 13,
        marginTop: 8,
    },
    moodRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    moodChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodChipLabel: {
        fontFamily: fontFamily.bold,
        fontSize: 12,
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
    noteFrame: {
        borderWidth: 1.5,
        borderRadius: 12,
        minHeight: 90,
        padding: 14,
    },
    noteInput: {
        fontFamily: fontFamily.medium,
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1.5,
        justifyContent: 'center',
    },
    deleteText: {
        fontFamily: fontFamily.bold,
        fontSize: 14,
    },
    saveButtonWrap: {
        flex: 1,
    },
    saveButton: {
        minHeight: 52,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveText: {
        fontFamily: fontFamily.extraBold,
        fontSize: 15,
    },
});
