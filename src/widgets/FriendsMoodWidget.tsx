import { MOOD_MAP } from '@/theme/moods';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MOOD_EMOJI } from './mood-emoji';
import { FriendsWidgetData } from './widget-data';

// Locket-style widget — shows up to 4 friends' latest moods (docs/Moodlet_Design_Guide_v1.0.docx
// §2.3 "Friends home screen widget"). Tapping anywhere opens the app; there's
// no friends backend yet so `friends` is seeded from src/widgets/mock-friends.ts.
export function FriendsMoodWidget({ friends }: FriendsWidgetData) {
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
            }}
        >
            <TextWidget
                text="Friends' moods"
                style={{ fontSize: 13, fontWeight: '800', color: '#121212', marginBottom: 8 }}
            />

            {friends.length === 0 ? (
                <TextWidget text="No friends yet — add some in the app." style={{ fontSize: 12, color: '#888780' }} />
            ) : (
                <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
                    {friends.slice(0, 4).map((friend) => {
                        const mood = MOOD_MAP[friend.mood];
                        return (
                            <FlexWidget
                                key={friend.id}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: 'match_parent',
                                    paddingVertical: 6,
                                }}
                            >
                                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FlexWidget
                                        style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: 15,
                                            backgroundColor: hex(mood.tintBg),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <TextWidget text={MOOD_EMOJI[friend.mood]} style={{ fontSize: 15 }} />
                                    </FlexWidget>
                                    <TextWidget
                                        text={friend.name}
                                        style={{ fontSize: 13, fontWeight: '700', color: '#121212', marginLeft: 8 }}
                                    />
                                </FlexWidget>
                                <TextWidget text={friend.timeLabel} style={{ fontSize: 11, color: '#888780' }} />
                            </FlexWidget>
                        );
                    })}
                </FlexWidget>
            )}
        </FlexWidget>
    );
}
