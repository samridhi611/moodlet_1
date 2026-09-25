import { requestWidgetUpdate } from 'react-native-android-widget';
import { FriendsMoodWidget } from './FriendsMoodWidget';
import { MoodCheckInWidget } from './MoodCheckInWidget';
import {
    FriendsWidgetData,
    MoodWidgetData,
    writeFriendsWidgetData,
    writeMoodWidgetData,
} from './widget-data';

// Called from the app (see src/widgets/WidgetSync.tsx) whenever the underlying
// data changes, so the cache the headless widget-task-handler reads from
// stays warm, and any widget already on the home screen redraws immediately.
export async function syncMoodWidget(data: MoodWidgetData) {
    await writeMoodWidgetData(data);
    await requestWidgetUpdate({
        widgetName: 'MoodCheckIn',
        renderWidget: () => <MoodCheckInWidget {...data} />,
    });
}

export async function syncFriendsWidget(data: FriendsWidgetData) {
    await writeFriendsWidgetData(data);
    await requestWidgetUpdate({
        widgetName: 'FriendsMood',
        renderWidget: () => <FriendsMoodWidget {...data} />,
    });
}
