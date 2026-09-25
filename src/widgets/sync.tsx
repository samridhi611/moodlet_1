import { requestWidgetUpdate } from 'react-native-android-widget';
import { FriendsMoodWidget } from './FriendsMoodWidget';
import { HourlyMoodWidget } from './HourlyMoodWidget';
import { MoodCheckInWidget } from './MoodCheckInWidget';
import { getWidgetColors } from './palette-for-widgets';
import {
    FriendsWidgetData,
    HourWidgetProps,
    MoodWidgetData,
    writeFriendsWidgetData,
    writeHoursWidgetData,
    writeMoodWidgetData,
} from './widget-data';

// Called from the app (see src/widgets/WidgetSync.tsx) whenever the underlying
// data changes, so the cache the headless widget-task-handler reads from
// stays warm, and any widget already on the home screen redraws immediately.
// Colors are re-read from the user's current in-app palette (see
// src/widgets/palette-for-widgets.ts) on every sync, so a palette switch in
// Profile is reflected on placed widgets without waiting for their next
// periodic refresh.
export async function syncMoodWidget(data: MoodWidgetData) {
    await writeMoodWidgetData(data);
    const colors = await getWidgetColors();
    await requestWidgetUpdate({
        widgetName: 'MoodCheckIn',
        renderWidget: () => <MoodCheckInWidget {...data} colors={colors} />,
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
