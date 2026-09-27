"use no memo";

import { PaletteColors } from '@/theme/design';
import { MOOD_INFO_MAP as MOOD_MAP, MoodId } from '@/theme/mood-data';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MOOD_EMOJI } from './mood-emoji';

export type TodayMoodWidgetProps = { todayMood: MoodId | null; colors: PaletteColors };

// Compact 2x2 companion to MoodCheckInWidget — shares its cache
// (widget-data.ts's MoodWidgetData / syncMoodWidget), just a square
// "today at a glance" framing instead of the full check-in row + tiles.
export function TodayMoodWidget({ todayMood, colors }: TodayMoodWidgetProps) {
    const mood = todayMood ? MOOD_MAP[todayMood] : null;

    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundGradient: mood
                    ? { from: hex(mood.tintBg), to: hex(colors.surface), orientation: 'TL_BR' }
                    : { from: hex(colors.primarySoft), to: hex(colors.surface), orientation: 'TL_BR' },
                borderRadius: 26,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <TextWidget
                text="TODAY"
                style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: hex(colors.muted) }}
            />
            {mood ? (
                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget text={MOOD_EMOJI[todayMood as MoodId]} style={{ fontSize: 34 }} />
                    <TextWidget
                        text={mood.label}
                        style={{ fontSize: 15, fontWeight: '800', color: hex(mood.tintAccent), marginTop: 4 }}
                    />
                </FlexWidget>
            ) : (
                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget text="—" style={{ fontSize: 30, fontWeight: '800', color: hex(colors.softMuted) }} />
                    <TextWidget
                        text="Not logged"
                        style={{ fontSize: 12, fontWeight: '600', color: hex(colors.muted), marginTop: 2 }}
                    />
                </FlexWidget>
            )}
            <TextWidget
                text="Tap to check in"
                style={{ fontSize: 10, fontWeight: '600', color: hex(colors.softMuted) }}
            />
        </FlexWidget>
    );
}
