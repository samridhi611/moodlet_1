import { usePalette } from '@/context/PaletteContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { MOOD_MAP } from '@/theme/moods';
import { loadFriends, toggleReaction } from '@/widgets/friends-store';
import { syncFriendsWidget } from '@/widgets/sync';
import { FriendMoodEntry } from '@/widgets/widget-data';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip, PressableScale, Widget } from './WidgetCard';

const RING = 66;

// Ported from moodlet/src/components/widgets/FriendsMoodWidget.tsx. Sources
// friend data from src/widgets/friends-store.ts (a small AsyncStorage store
// seeded from mock-friends.ts) rather than a live backend — Friends has none
// yet, same as moodlet. Reaction taps persist locally and are re-pushed to
// the native FriendsMood widget's cache via syncFriendsWidget so a placed
// widget picks up the change too.
export function FriendsMoodWidget() {
    const { colors, styles: sharedStyles } = usePalette();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [friends, setFriends] = useState<FriendMoodEntry[]>([]);
    const [activeId, setActiveId] = useState<string | undefined>(undefined);

    useEffect(() => {
        loadFriends().then((loaded) => {
            setFriends(loaded);
            setActiveId((current) => current ?? loaded[0]?.id);
        });
    }, []);

    const active = friends.find((f) => f.id === activeId);
    const activeMood = active ? MOOD_MAP[active.mood] : null;
    const goodCount = friends.filter((f) => MOOD_MAP[f.mood].score >= 5).length;

    const handleReact = async (friendId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const updated = await toggleReaction(friendId);
        setFriends(updated);
        if (Platform.OS === 'android') {
            syncFriendsWidget({ friends: updated }).catch(() => {});
        }
    };

    if (friends.length === 0) return null;

    return (
        <Widget
            colors={colors}
            styles={sharedStyles}
            kicker="Your circle"
            title="Friends’ moods"
            right={<Chip label={`${goodCount}/${friends.length} vibing`} colors={colors} />}
            tint={activeMood ? [activeMood.tintBg, activeMood.tintAccent] : [colors.primarySoft, colors.accent]}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.strip}
                style={styles.stripOuter}
            >
                {friends.map((f) => (
                    <FriendBubble
                        key={f.id}
                        friend={f}
                        active={f.id === activeId}
                        colors={colors}
                        styles={styles}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setActiveId(f.id);
                        }}
                    />
                ))}
            </ScrollView>

            {active && (
                <View style={styles.detail}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.detailName}>
                            {active.name} is feeling{' '}
                            <Text style={{ color: MOOD_MAP[active.mood].tintAccent }}>
                                {MOOD_MAP[active.mood].label.toLowerCase()}
                            </Text>
                        </Text>
                        <Text style={styles.detailStatus} numberOfLines={1}>
                            “{active.status}” · {formatAgo(active.minutesAgo)}
                        </Text>
                    </View>
                    <PressableScale
                        scaleTo={0.8}
                        onPress={() => handleReact(active.id)}
                        accessibilityLabel={active.reacted ? 'Remove reaction' : 'Send love'}
                    >
                        <View style={[styles.react, active.reacted && styles.reactOn]}>
                            <Text style={{ fontSize: 20 }}>{active.reacted ? '💛' : '🤍'}</Text>
                        </View>
                    </PressableScale>
                </View>
            )}
        </Widget>
    );
}

function FriendBubble({
    friend,
    active,
    colors,
    styles,
    onPress,
}: {
    friend: FriendMoodEntry;
    active: boolean;
    colors: PaletteColors;
    styles: ReturnType<typeof createStyles>;
    onPress: () => void;
}) {
    const mood = MOOD_MAP[friend.mood];
    const MoodIcon = mood.Icon;
    return (
        <PressableScale onPress={onPress} style={styles.bubble}>
            <LinearGradient
                colors={[mood.tintBg, mood.tintAccent]}
                style={[styles.ring, !active && { opacity: 0.5 }]}
            >
                <View style={styles.ringGap}>
                    <View style={[styles.avatar, { backgroundColor: friend.avatarColor }]}>
                        <Text style={styles.initial}>{friend.name[0]}</Text>
                    </View>
                </View>
            </LinearGradient>
            <View style={styles.badge}>
                <MoodIcon size={14} color={mood.tintAccent} strokeWidth={2.4} />
            </View>
            <Text style={[styles.name, active && { color: colors.ink }]}>{friend.name}</Text>
        </PressableScale>
    );
}

function formatAgo(mins: number) {
    if (mins < 60) return `${mins}m`;
    return `${Math.round(mins / 60)}h`;
}

const createStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        stripOuter: { marginHorizontal: -18 },
        strip: { paddingHorizontal: 18, gap: 14 },
        bubble: { alignItems: 'center', width: RING + 4 },
        ring: { width: RING, height: RING, borderRadius: RING / 2, padding: 2.5 },
        ringGap: {
            flex: 1,
            borderRadius: RING,
            backgroundColor: colors.surface,
            padding: 3,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatar: { flex: 1, width: '100%', borderRadius: RING, alignItems: 'center', justifyContent: 'center' },
        initial: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.white },
        badge: {
            position: 'absolute',
            top: RING - 22,
            right: 0,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        name: { marginTop: 8, fontFamily: fontFamily.medium, fontSize: 12, color: colors.muted },
        detail: {
            marginTop: 16,
            padding: 14,
            borderRadius: 18,
            backgroundColor: colors.surfaceWarm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        detailName: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.ink },
        detailStatus: { marginTop: 3, fontFamily: fontFamily.medium, fontSize: 13, color: colors.muted },
        react: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        reactOn: { backgroundColor: colors.accent + '55' },
    });
