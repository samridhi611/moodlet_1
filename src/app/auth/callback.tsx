import { usePalette } from '@/context/PaletteContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Expo Router matches the OAuth deep link (moodlet://auth/callback) to this route
// before AuthContext's WebBrowser session promise resolves. This screen is a brief
// landing pad — AuthContext finishes the sign-in and ProfileContext redirects away
// as soon as the session is set, so this never lives longer than a flash.
export default function AuthCallbackScreen() {
  const { colors } = usePalette();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
