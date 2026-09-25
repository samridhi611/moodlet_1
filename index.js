// Custom entry point, replacing the default `expo-router/entry`, so we can
// also register the Android widget task handler (react-native-android-widget
// requires this to happen at the app's root module, alongside AppRegistry
// registration) — see src/widgets/widget-task-handler.tsx.
import '@expo/metro-runtime';

import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from './src/widgets/widget-task-handler';

renderRootComponent(App);
registerWidgetTaskHandler(widgetTaskHandler);
