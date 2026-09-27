"use no memo";

import { PaletteColors } from '@/theme/design';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { hex } from './hex';
import { MoodWidgetData } from './widget-data';

export type StreakWidgetProps = Pick<MoodWidgetData, 'streak'> & { colors: PaletteColors };

// Compact 2x2 companion to MoodCheckInWidget — same streak number, square
// format for a home-screen widget grid. Shares MoodCheckIn's cache
// (widget-data.ts's MoodWidgetData / syncMoodWidget) rather than its own —
// see sync.tsx.
export function StreakWidget({ streak, colors }: StreakWidgetProps) {
    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundGradient: { from: hex(colors.primarySoft), to: hex(colors.surface), orientation: 'TL_BR' },
                borderRadius: 26,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <TextWidget
                text="STREAK"
                style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: hex(colors.muted) }}
            />
            <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <TextWidget text={String(streak)} style={{ fontSize: 40, fontWeight: '800', color: hex(colors.primaryDark) }} />
                <TextWidget text=" 🔥" style={{ fontSize: 22, marginBottom: 4 }} />
            </FlexWidget>
            <TextWidget
                text={streak === 1 ? 'day in a row' : 'days in a row'}
                style={{ fontSize: 11, fontWeight: '600', color: hex(colors.muted) }}
            />
        </FlexWidget>
    );
}
