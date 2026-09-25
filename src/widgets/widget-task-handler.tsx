import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { FriendsMoodWidget } from './FriendsMoodWidget';
import { MoodCheckInWidget } from './MoodCheckInWidget';
import { readFriendsWidgetData, readMoodWidgetData } from './widget-data';

// Registered once from the app's custom entry point (index.js). Runs headless
// on Android — outside the app's provider tree — whenever a widget is added,
// resized, or due for its periodic refresh. Widget clicks (OPEN_APP/OPEN_URI)
// are handled natively by react-native-android-widget before this ever runs,
// so there's no WIDGET_CLICK case to handle here.
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED': {
            if (props.widgetInfo.widgetName === 'MoodCheckIn') {
                const data = await readMoodWidgetData();
                props.renderWidget(<MoodCheckInWidget {...data} />);
            } else if (props.widgetInfo.widgetName === 'FriendsMood') {
                const data = await readFriendsWidgetData();
                props.renderWidget(<FriendsMoodWidget {...data} />);
            }
            break;
        }
        default:
            break;
    }
}
