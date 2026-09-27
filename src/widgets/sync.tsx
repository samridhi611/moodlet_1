import { requestWidgetUpdate } from 'react-native-android-widget';
import { FriendsMoodWidget } from './FriendsMoodWidget';
import { HourlyMoodWidget } from './HourlyMoodWidget';
import { MoodCheckInWidget } from './MoodCheckInWidget';
import { getWidgetColors } from './palette-for-widgets';
import { StreakWidget } from './StreakWidget';
import { TodayMoodWidget } from './TodayMoodWidget';
import { WeekWaveWidget } from './WeekWaveWidget';
import {
    FriendsWidgetData,
    HourWidgetProps,
    MoodWidgetData,
    WeekWidgetData,
    writeFriendsWidgetData,
    writeHoursWidgetData,
    writeMoodWidgetData,
    writeWeekWidgetData,
} from './widget-data';

// Called from the app (see src/widgets/WidgetSync.tsx) whenever the underlying
// data changes, so the cache the headless widget-task-handler reads from
// stays warm, and any widget already on the home screen redraws immediately.
// Colors are re-read from the user's current in-app palette (see
// src/widgets/palette-for-widgets.ts) on every sync, so a palette switch in
// Profile is reflected on placed widgets without waiting for their next
// periodic refresh.
// MoodCheckIn, Streak, and TodayMood all read the same MoodWidgetData cache —
// three different home-screen framings (full row / 2x2 streak / 2x2 today) of
// one underlying sync, so a single write here refreshes all three placed widgets.
export async function syncMoodWidget(data: MoodWidgetData) {
    await writeMoodWidgetData(data);
    const colors = await getWidgetColors();
    await requestWidgetUpdate({
        widgetName: 'MoodCheckIn',
        renderWidget: () => <MoodCheckInWidget {...data} colors={colors} />,
    });
    await requestWidgetUpdate({
        widgetName: 'Streak',
        renderWidget: () => <StreakWidget streak={data.streak} colors={colors} />,
    });
    await requestWidgetUpdate({
        widgetName: 'TodayMood',
        renderWidget: () => <TodayMoodWidget todayMood={data.todayMood} colors={colors} />,
    });
}

export async function syncFriendsWidget(data: FriendsWidgetData) {
    await writeFriendsWidgetData(data);
    const colors = await getWidgetColors();
    await requestWidgetUpdate({
        widgetName: 'FriendsMood',
        renderWidget: () => <FriendsMoodWidget {...data} colors={colors} />,
    });
}

export async function syncHoursWidget(data: HourWidgetProps) {
    await writeHoursWidgetData(data);
    const colors = await getWidgetColors();
    await requestWidgetUpdate({
        widgetName: 'HourlyMood',
        renderWidget: () => <HourlyMoodWidget {...data} colors={colors} />,
    });
}

export async function syncWeekWidget(data: WeekWidgetData) {
    await writeWeekWidgetData(data);
    const colors = await getWidgetColors();
    await requestWidgetUpdate({
        widgetName: 'WeekWave',
        renderWidget: () => <WeekWaveWidget {...data} colors={colors} />,
    });
}
