"use no memo";

import { PaletteColors } from '@/theme/design';
import { MOOD_INFO as MOODS, MOOD_INFO_MAP as MOOD_MAP } from '@/theme/mood-data';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MOOD_EMOJI } from './mood-emoji';
import { HourWidgetProps } from './widget-data';

export type HourlyMoodWidgetProps = HourWidgetProps & { colors: PaletteColors; tall?: boolean };

// Local-only mood timeline — ported from moodlet's HourlyMoodAndroid. Unlike
// MoodCheckIn, tapping a mood on the "this hour" row writes headlessly and
// directly (see src/widgets/widget-task-handler.tsx's HOUR click branch):
// this data has no Supabase equivalent (moodlet_1's `entries` table is one
// row per day), so there's no authenticated-write risk to a headless
// process — hours-store.ts is local AsyncStorage state end to end.
export function HourlyMoodWidget({ hours, avgMoodId, avgEmoji, colors, tall = false }: HourlyMoodWidgetProps) {
    const nowHour = new Date().getHours();
    const avgMood = avgMoodId ? MOOD_MAP[avgMoodId] : null;
    const barHeight = (score: number) => (tall ? 18 + score * 8 : 8 + score * 4);
    const barColor = (h: number) => {
        const cell = hours[h];
        if (cell) return hex(MOOD_MAP[cell.moodId].tintAccent);
        if (h === nowHour) return hex(colors.accent);
        return hex(h > nowHour ? colors.border : colors.borderStrong);
    };

    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundGradient: avgMood
                    ? { from: hex(avgMood.tintBg), to: hex(colors.surface), orientation: 'TL_BR' }
                    : { from: hex(colors.primarySoft), to: hex(colors.surface), orientation: 'TL_BR' },
                borderRadius: 26,
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
                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget
                        text="TODAY, HOUR BY HOUR"
                        style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: hex(colors.muted) }}
                    />
                    <TextWidget text="Mood timeline" style={{ fontSize: 15, fontWeight: '800', color: hex(colors.ink) }} />
                </FlexWidget>
                {avgEmoji && avgMood && (
                    <FlexWidget
                        style={{
                            backgroundColor: hex(colors.surface),
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <TextWidget text={`avg ${avgEmoji}`} style={{ fontSize: 11, fontWeight: '700', color: hex(avgMood.tintAccent) }} />
                    </FlexWidget>
                )}
            </FlexWidget>

            <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end', width: 'match_parent', justifyContent: 'space-between' }}>
                {hours.map((cell, h) => (
                    <FlexWidget
                        key={h}
                        style={{
                            width: 7,
                            height: cell ? barHeight(cell.score) : 5,
                            borderRadius: 4,
                            backgroundColor: barColor(h),
                        }}
                    />
                ))}
            </FlexWidget>

            <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextWidget text="This hour" style={{ fontSize: 11, fontWeight: '600', color: hex(colors.muted) }} />
                <FlexWidget style={{ flexDirection: 'row' }}>
                    {MOODS.map((mood) => {
                        const active = hours[nowHour]?.moodId === mood.id;
                        return (
                            <FlexWidget
                                key={mood.id}
                                clickAction="HOUR"
                                clickActionData={{ mood: mood.id, hour: nowHour }}
                                accessibilityLabel={`${mood.label} this hour`}
                                style={{
                                    width: tall ? 34 : 24,
                                    height: tall ? 34 : 24,
                                    borderRadius: tall ? 17 : 12,
                                    marginLeft: 4,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: active ? hex(mood.tintBg) : hex(colors.blush),
                                }}
                            >
                                <TextWidget text={MOOD_EMOJI[mood.id]} style={{ fontSize: tall ? 17 : 13 }} />
                            </FlexWidget>
                        );
                    })}
                </FlexWidget>
            </FlexWidget>
        </FlexWidget>
    );
}
