import { PrimaryButton } from '@/components/ui/primary-button';
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { isSignedIn, signInWithGoogle } = useAuth();
  const { colors, styles: s } = usePalette();      // ← shared design system
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);


  if (isSignedIn) return <Redirect href="/(tabs)" />;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    // background is the one color value not in shared styles — inline is fine here
    <SafeAreaView style={[s.layout.safeArea, { backgroundColor: colors.background }]}>
      <View style={screen.container}>

        <View style={screen.topBar}>
          <Image
            source={require('@/assets/images/moodlet_logo.svg')}
            style={screen.logo}
            contentFit="contain"
          />
        </View>

        <View style={screen.hero}>
          {/* screen-specific font size/transform — extend shared type with local override */}
          <Text style={[s.type.screenTitle, screen.heroTitle]}>
            feel it. name it. let it pass.
          </Text>
          <Text style={[s.type.subtitle, screen.heroSubtitle]}>
            A tiny mood journal for quick check-ins, late-night thoughts, and the days
            you do not want to explain.
          </Text>
        </View>

        <View style={screen.footer}>
          {error ? <Text style={s.input.errorText}>{error}</Text> : null}

          <PrimaryButton
            label="Sign in with Google"
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            loading={isSigningIn}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── Screen-specific layout ───────────────────────────────────────────────────
const screen = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logo: {
    height: 50,
    marginTop: 30,
    width: 120,
  },
  hero: {
    gap: 16,
  },
  // Overrides on top of s.type.screenTitle
  heroTitle: {
    fontSize: 56,
    lineHeight: 58,
    maxWidth: 370,
    textTransform: 'lowercase',
  },
  // Overrides on top of s.type.subtitle
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 350,
  },
  footer: {
    gap: 12,
  },
});