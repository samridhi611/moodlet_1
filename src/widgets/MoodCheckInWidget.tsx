"use no memo";

import { PaletteColors } from '@/theme/design';
import { MOOD_INFO_MAP as MOOD_MAP, MoodId } from '@/theme/mood-data';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MOOD_EMOJI } from './mood-emoji';
import { MoodWidgetData } from './widget-data';

// Duolingo-style quick-log row — tapping a tile fires an OPEN_URI clickAction
// straight to `moodlet://check-in?mood=<id>`, which src/app/(tabs)/_layout.tsx
// picks up and logs instantly through EntriesContext.addEntry (Supabase-backed).
// CRITICAL: this MUST stay OPEN_URI, never a local headless write — a
// headless widget process can't safely make an authenticated Supabase call
// (no guaranteed session/network), and writing mood data outside Supabase
// would silently break streaks/Year-in-Pixels/cross-device sync. The
// HourlyMood widget (src/widgets/HourlyMoodWidget.tsx) is the one exception
// that's allowed to write headlessly, because it's genuinely local-only data.
// Only 4 moods fit the available widget width at a comfortable tap size; the
// full 8-mood check-in sheet is still one tap (OPEN_APP) away.
const QUICK_MOODS: MoodId[] = ['happy', 'calm', 'sad', 'tired'];

export type MoodCheckInWidgetProps = MoodWidgetData & { colors: PaletteColors };

// Widget components render to native Android views, not React Native views —
// only FlexWidget/TextWidget/ImageWidget/ListWidget primitives are allowed
// here, no hooks, no lucide icons. Colors are always taken from the `colors`
// prop (resolved from the user's in-app palette by getWidgetColors() in
// widget-task-handler.tsx / sync.tsx) — this component itself never touches
// AsyncStorage, it stays a pure props-in component.
export function MoodCheckInWidget({ username, streak, todayMood, colors }: MoodCheckInWidgetProps) {
    const loggedMood = todayMood ? MOOD_MAP[todayMood] : null;

    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: hex(colors.surface),
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 'match_parent',
                }}
            >
                <TextWidget text={`Hi, ${username}`} style={{ fontSize: 15, fontWeight: '800', color: hex(colors.ink) }} />
                {streak > 0 && (
                    <FlexWidget
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: hex(colors.primarySoft),
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <TextWidget text={`🔥 ${streak}`} style={{ fontSize: 12, fontWeight: '700', color: hex(colors.primaryDark) }} />
                    </FlexWidget>
                )}
            </FlexWidget>

            {loggedMood && todayMood ? (
                <FlexWidget
                    clickAction="OPEN_APP"
                    style={{
                        flexDirection: 'column',
                        backgroundColor: hex(colors.primarySoft),
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        width: 'match_parent',
                    }}
                >
                    <TextWidget
                        text="LOGGED TODAY"
                        style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: hex(colors.muted) }}
                    />
                    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <TextWidget text={MOOD_EMOJI[todayMood]} style={{ fontSize: 24 }} />
                        <TextWidget
                            text={loggedMood.label}
                            style={{ fontSize: 17, fontWeight: '800', color: hex(colors.primaryDark), marginLeft: 8 }}
                        />
                    </FlexWidget>
                </FlexWidget>
            ) : (
                <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
                    <TextWidget
                        text="How's the vibe?"
                        style={{ fontSize: 17, fontWeight: '800', color: hex(colors.ink), marginBottom: 10 }}
                    />
                    <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}>
                        {QUICK_MOODS.map((id) => {
                            const mood = MOOD_MAP[id];
                            return (
                                <FlexWidget
                                    key={id}
                                    clickAction="OPEN_URI"
                                    clickActionData={{ uri: `moodlet://check-in?mood=${id}` }}
                                    accessibilityLabel={`Log ${mood.label} mood`}
                                    style={{
                                        width: 54,
                                        height: 64,
                                        backgroundColor: hex(colors.primarySoft),
                                        borderRadius: 18,
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <TextWidget text={MOOD_EMOJI[id]} style={{ fontSize: 26 }} />
                                    <TextWidget
                                        text={mood.label}
                                        style={{ fontSize: 9, fontWeight: '600', color: hex(colors.muted), marginTop: 2 }}
                                    />
                                </FlexWidget>
                            );
                        })}
                    </FlexWidget>
                </FlexWidget>
            )}
        </FlexWidget>
    );
}
