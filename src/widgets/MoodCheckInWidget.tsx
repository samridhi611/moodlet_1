import { MOOD_MAP, MoodId } from '@/theme/moods';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MOOD_EMOJI } from './mood-emoji';
import { MoodWidgetData } from './widget-data';

// Duolingo-style quick-log row — tapping a tile fires an OPEN_URI clickAction
// straight to `moodlet://check-in?mood=<id>`, which src/app/(tabs)/_layout.tsx
// picks up and logs instantly, no sheet required. Only 4 moods fit the
// available widget width; the full 8-mood check-in is still one tap away.
const QUICK_MOODS: MoodId[] = ['happy', 'calm', 'sad', 'tired'];

// Widget components render to native Android views, not React Native views —
// only FlexWidget/TextWidget/ImageWidget/ListWidget primitives are allowed
// here, no hooks, no lucide icons.
export function MoodCheckInWidget({ username, streak, todayMood }: MoodWidgetData) {
    const loggedMood = todayMood ? MOOD_MAP[todayMood] : null;

    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#FFFFFF',
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
                <TextWidget text={`Hi, ${username}`} style={{ fontSize: 15, fontWeight: '800', color: '#121212' }} />
                {streak > 0 && (
                    <FlexWidget
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#FAEEDA',
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <TextWidget text={`🔥 ${streak}`} style={{ fontSize: 12, fontWeight: '700', color: '#BA7517' }} />
                    </FlexWidget>
                )}
            </FlexWidget>

            {loggedMood && todayMood ? (
                <FlexWidget
                    clickAction="OPEN_APP"
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: hex(loggedMood.tintBg),
                        borderRadius: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        width: 'match_parent',
                    }}
                >
                    <TextWidget text={MOOD_EMOJI[todayMood]} style={{ fontSize: 20 }} />
                    <TextWidget
                        text={`Today: ${loggedMood.label}`}
                        style={{ fontSize: 13, fontWeight: '700', color: hex(loggedMood.tintAccent), marginLeft: 8 }}
                    />
                </FlexWidget>
            ) : (
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
                                    width: 60,
                                    height: 60,
                                    backgroundColor: hex(mood.tintBg),
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <TextWidget text={MOOD_EMOJI[id]} style={{ fontSize: 22 }} />
                            </FlexWidget>
                        );
                    })}
                </FlexWidget>
            )}
        </FlexWidget>
    );
}
