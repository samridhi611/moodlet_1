"use no memo";

import { PaletteColors } from '@/theme/design';
import { MOOD_INFO_MAP as MOOD_MAP } from '@/theme/mood-data';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MOOD_EMOJI } from './mood-emoji';
import { FriendMoodEntry, FriendsWidgetData } from './widget-data';

// A friend counts as "vibing" once their mood's valence score (src/theme/moods.ts)
// is at or above this — calm/loved/happy/excited, the upper half of the scale.
const VIBING_THRESHOLD = 5;

const formatAgo = (minutesAgo: number) => {
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${Math.round(minutesAgo)}m ago`;
    if (minutesAgo < 60 * 24) return `${Math.round(minutesAgo / 60)}h ago`;
    return 'Yesterday';
};

function Avatar({ friend, colors, size }: { friend: FriendMoodEntry; colors: PaletteColors; size: number }) {
    const initial = friend.name.charAt(0).toUpperCase();
    const ringColor = MOOD_MAP[friend.mood].tintAccent;
    return (
        <FlexWidget style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: hex(ringColor), padding: 2 }}>
            <FlexWidget
                style={{
                    width: 'match_parent',
                    height: 'match_parent',
                    borderRadius: size / 2,
                    backgroundColor: hex(colors.surface),
                    padding: 2,
                }}
            >
                <FlexWidget
                    style={{
                        width: 'match_parent',
                        height: 'match_parent',
                        borderRadius: size / 2,
                        backgroundColor: hex(friend.avatarColor),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TextWidget text={initial} style={{ fontSize: size * 0.4, fontWeight: '800', color: hex(colors.white) }} />
                </FlexWidget>
            </FlexWidget>
        </FlexWidget>
    );
}

export type FriendsMoodWidgetProps = FriendsWidgetData & { colors: PaletteColors; tall?: boolean };

// Locket-style widget — shows up to 4 friends' latest moods (docs/Moodlet_Design_Guide_v1.0.docx
// §2.3 "Friends home screen widget"). There's no friends backend yet so
// `friends` is seeded from src/widgets/mock-friends.ts. Tapping anywhere
// opens the app. `tall` switches between a stacked detail list (roomier
// widget placements) and a compact avatar row (small placements) — mirrors
// moodlet's FriendsMoodAndroid `tall` variant, driven by widgetInfo.height in
// widget-task-handler.tsx.
export function FriendsMoodWidget({ friends, colors, tall = false }: FriendsMoodWidgetProps) {
    const vibing = friends.filter((f) => MOOD_MAP[f.mood].score >= VIBING_THRESHOLD).length;
    const shown = friends.slice(0, 4);
    const topMood = shown.length > 0 ? MOOD_MAP[shown[0].mood] : null;

    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundGradient: topMood
                    ? { from: hex(topMood.tintBg), to: hex(colors.surface), orientation: 'TL_BR' }
                    : { from: hex(colors.primarySoft), to: hex(colors.surface), orientation: 'TL_BR' },
                borderRadius: 26,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'column',
            }}
        >
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 'match_parent',
                    marginBottom: 10,
                }}
            >
                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget
                        text="YOUR CIRCLE"
                        style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: hex(colors.muted) }}
                    />
                    <TextWidget text="Friends' vibes" style={{ fontSize: 15, fontWeight: '800', color: hex(colors.ink) }} />
                </FlexWidget>
                {friends.length > 0 && (
                    <FlexWidget
                        style={{
                            backgroundColor: hex(colors.primarySoft),
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <TextWidget
                            text={`${vibing}/${friends.length} vibing`}
                            style={{ fontSize: 11, fontWeight: '700', color: hex(colors.primaryDark) }}
                        />
                    </FlexWidget>
                )}
            </FlexWidget>

            {shown.length === 0 ? (
                <TextWidget text="No friends yet — add some in the app." style={{ fontSize: 12, color: hex(colors.muted) }} />
            ) : tall ? (
                <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
                    {shown.map((friend) => (
                        <FlexWidget
                            key={friend.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: 'match_parent',
                                paddingVertical: 6,
                            }}
                        >
                            <Avatar friend={friend} colors={colors} size={40} />
                            <FlexWidget style={{ flexDirection: 'column', flex: 1, marginLeft: 10 }}>
                                <TextWidget
                                    text={`${friend.name} · ${MOOD_MAP[friend.mood].label}`}
                                    style={{ fontSize: 13, fontWeight: '700', color: hex(colors.ink) }}
                                />
                                <TextWidget
                                    text={friend.status}
                                    maxLines={1}
                                    truncate="END"
                                    style={{ fontSize: 11, color: hex(colors.muted) }}
                                />
                            </FlexWidget>
                            <TextWidget
                                text={`${MOOD_EMOJI[friend.mood]} ${formatAgo(friend.minutesAgo)}`}
                                style={{ fontSize: 11, color: hex(colors.softMuted) }}
                            />
                        </FlexWidget>
                    ))}
                </FlexWidget>
            ) : (
                <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', justifyContent: 'space-between' }}>
                    {shown.map((friend) => (
                        <FlexWidget key={friend.id} style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar friend={friend} colors={colors} size={46} />
                            <TextWidget
                                text={`${MOOD_EMOJI[friend.mood]} ${friend.name}`}
                                style={{ fontSize: 11, fontWeight: '600', color: hex(colors.ink), marginTop: 4 }}
                            />
                        </FlexWidget>
                    ))}
                </FlexWidget>
            )}
        </FlexWidget>
    );
}
