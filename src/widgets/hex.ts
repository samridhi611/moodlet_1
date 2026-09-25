import { HexColor } from 'react-native-android-widget';

// Theme tokens (src/theme/moods.ts, src/theme/theme.ts) are typed as plain
// `string` since they're shared with React Native's StyleSheet, but widget
// primitives require the stricter `#RRGGBB` ColorProp — this just re-asserts
// what's already true at runtime.
export const hex = (value: string) => value as HexColor;
