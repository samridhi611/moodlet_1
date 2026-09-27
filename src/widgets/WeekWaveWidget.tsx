"use no memo";

import { PaletteColors } from '@/theme/design';
import { MOOD_INFO_MAP as MOOD_MAP } from '@/theme/mood-data';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MOOD_EMOJI } from './mood-emoji';
import { WeekWidgetData } from './widget-data';

export type WeekWaveWidgetProps = WeekWidgetData & { colors: PaletteColors };

// Portrait 2x3 widget — last 7 days as compact vertical rows (day letter +
// a mood-tinted pill). Data is pre-computed in-app from useEntries() and
// pushed via syncWeekWidget (see src/widgets/WidgetSync.tsx, sync.tsx) since
// a headless process can't read Supabase-backed entries itself.
export function WeekWaveWidget({ days, colors }: WeekWaveWidgetProps) {
    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundGradient: { from: hex(colors.primarySoft), to: hex(colors.surface), orientation: 'TOP_BOTTOM' },
                borderRadius: 26,
                paddingHorizontal: 14,
                paddingVertical: 14,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <TextWidget
                text="THIS WEEK"
                style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: hex(colors.muted) }}
            />
            <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
                {days.map((day, i) => {
                    const mood = day.moodId ? MOOD_MAP[day.moodId] : null;
                    return (
                        <FlexWidget
                            key={i}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: 'match_parent',
                                paddingVertical: 4,
                            }}
                        >
                            <TextWidget
                                text={day.label}
                                style={{
                                    fontSize: 12,
                                    fontWeight: day.today ? '800' : '600',
                                    color: hex(day.today ? colors.ink : colors.muted),
                                }}
                            />
                            {mood && day.moodId ? (
                                <FlexWidget
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: hex(mood.tintBg),
                                        borderRadius: 999,
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                    }}
                                >
                                    <TextWidget text={MOOD_EMOJI[day.moodId]} style={{ fontSize: 13 }} />
                                </FlexWidget>
                            ) : (
                                <FlexWidget
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        backgroundColor: hex(colors.border),
                                    }}
                                />
                            )}
                        </FlexWidget>
                    );
                })}
            </FlexWidget>
        </FlexWidget>
    );
}
