import { MoodId } from '@/theme/mood-data';
import { requestWidgetUpdate, WidgetTaskHandlerProps } from 'react-native-android-widget';
import { FriendsMoodWidget } from './FriendsMoodWidget';
import { HourlyMoodWidget } from './HourlyMoodWidget';
import { applyHour, loadHours, saveHours } from './hours-store';
import { MoodCheckInWidget } from './MoodCheckInWidget';
import { getWidgetColors } from './palette-for-widgets';
import {
    hourWidgetProps,
    readFriendsWidgetData,
    readHoursWidgetData,
    readMoodWidgetData,
    writeHoursWidgetData,
} from './widget-data';

// Registered once from the app's custom entry point (index.js). Runs headless
// on Android — outside the app's provider tree — whenever a widget is added,
// resized, or due for its periodic refresh, and (for HourlyMood's hour-tap
// row only) when it's clicked. MoodCheckIn/FriendsMood clicks are OPEN_APP /
// OPEN_URI, handled natively by react-native-android-widget before this ever
// runs — there's deliberately no click branch for them here (see
// MoodCheckInWidget.tsx for why a headless write there would be unsafe).
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const { widgetAction, widgetInfo, clickAction, clickActionData, renderWidget } = props;

    if (widgetAction === 'WIDGET_DELETED') return;

    // HourlyMood's "this hour" row writes headlessly and directly — this is
    // local-only AsyncStorage data (hours-store.ts) with no Supabase/auth
    // involved, so it's safe to write from this headless process.
    if (widgetAction === 'WIDGET_CLICK' && clickAction === 'HOUR' && clickActionData?.mood) {
        const mood = clickActionData.mood as MoodId;
        const hour = typeof clickActionData.hour === 'number' ? clickActionData.hour : new Date().getHours();

        const hours = await loadHours();
        await saveHours(applyHour(hours, hour, mood));

        const data = await hourWidgetProps();
        await writeHoursWidgetData(data);
        const colors = await getWidgetColors();
        await requestWidgetUpdate({
            widgetName: 'HourlyMood',
            renderWidget: () => <HourlyMoodWidget {...data} colors={colors} />,
        });
        return;
    }

    switch (widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED': {
            const colors = await getWidgetColors();
            if (widgetInfo.widgetName === 'MoodCheckIn') {
                const data = await readMoodWidgetData();
                renderWidget(<MoodCheckInWidget {...data} colors={colors} />);
            } else if (widgetInfo.widgetName === 'FriendsMood') {
                const data = await readFriendsWidgetData();
                renderWidget(<FriendsMoodWidget {...data} colors={colors} tall={widgetInfo.height > 250} />);
            } else if (widgetInfo.widgetName === 'HourlyMood') {
                const data = await readHoursWidgetData();
                renderWidget(<HourlyMoodWidget {...data} colors={colors} tall={widgetInfo.height > 250} />);
            }
            break;
        }
        default:
            break;
    }
}
