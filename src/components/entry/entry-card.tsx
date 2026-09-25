import { useEditEntry } from '@/context/EditEntryContext';
import { usePalette } from '@/context/PaletteContext';
import { ACTIVITY_MAP } from '@/theme/activities';
import { fontFamily } from '@/theme/design';
import { MOOD_MAP } from '@/theme/moods';
import { Entry } from '@/types/entry';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

// docs/Moodlet_Design_Guide_v1.0.docx §10.2 — "Entry cards: accessible summary
// includes mood, time, and activity count."
const buildSummary = (entry: Entry, moodLabel: string) => {
    const time = formatTime(entry.created_at);
    if (entry.activities.length === 0) return `${moodLabel}, logged at ${time}`;
    const noun = entry.activities.length === 1 ? 'activity' : 'activities';
    return `${moodLabel}, logged at ${time}, ${entry.activities.length} ${noun}`;
};

export function EntryCard({ entry }: { entry: Entry }) {
    const { colors } = usePalette();
    const { open: openEdit } = useEditEntry();
    const mood = MOOD_MAP[entry.mood];
    const MoodIcon = mood.Icon;

    return (
        <View style={[styles.card, { backgroundColor: mood.tintBg, borderColor: mood.tintAccent + '4D' }]}>
            <Pressable
                onPress={() => openEdit(entry)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Edit entry"
                style={styles.editAffordance}
            >
                <Text style={[styles.editText, { color: colors.muted }]}>edit</Text>
            </Pressable>

            <View accessible accessibilityLabel={buildSummary(entry, mood.label)} style={styles.contentGroup}>
                <View style={styles.headerRow}>
                    <View style={[styles.iconWrap, { backgroundColor: mood.tintAccent + '1F' }]}>
                        <MoodIcon size={20} color={mood.tintAccent} strokeWidth={2} />
                    </View>
                    <View style={styles.headerCopy}>
                        <Text style={[styles.moodWord, { color: mood.tintAccent }]}>{mood.label}</Text>
                        <Text style={[styles.timestamp, { color: mood.tintAccent }]}>
                            {formatTime(entry.created_at)}
                        </Text>
                    </View>
                </View>

                {entry.activities.length > 0 && (
                    <View style={styles.tagRow}>
                        {entry.activities.map((id) => (
                            <View key={id} style={[styles.tag, { backgroundColor: colors.background }]}>
                                <Text style={[styles.tagText, { color: mood.tintAccent }]}>
                                    {ACTIVITY_MAP[id]?.label ?? id}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {entry.note && (
                    <Text style={[styles.note, { color: mood.tintAccent }]} numberOfLines={3}>
                        {entry.note}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 0.5,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    editAffordance: {
        position: 'absolute',
        top: 14,
        right: 16,
        zIndex: 1,
    },
    editText: {
        fontFamily: fontFamily.semiBold,
        fontSize: 12,
    },
    contentGroup: {
        gap: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCopy: {
        gap: 2,
    },
    moodWord: {
        fontFamily: fontFamily.bold,
        fontSize: 15,
    },
    timestamp: {
        fontFamily: fontFamily.medium,
        fontSize: 12,
        opacity: 0.75,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tagText: {
        fontFamily: fontFamily.semiBold,
        fontSize: 11,
        letterSpacing: 0.4,
    },
    note: {
        fontFamily: fontFamily.medium,
        fontStyle: 'italic',
        fontSize: 13,
        lineHeight: 19,
        opacity: 0.85,
    },
});
