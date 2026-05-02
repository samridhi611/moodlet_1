import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { createPaletteColors, fontFamily, PaletteColors } from '@/theme/design';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const { isSignedIn, signInWithGoogle } = useAuth();
  const { tokens } = usePalette();
  const colors = useMemo(() => createPaletteColors(tokens), [tokens]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Image source={require('@/assets/images/moodlet_logo.svg')} style={styles.logo} contentFit="contain" />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>feel it. name it. let it pass.</Text>
          <Text style={styles.subtitle}>
            A tiny mood journal for quick check-ins, late-night thoughts, and the days you do not want to explain.
          </Text>
        </View>

        <View style={styles.footer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Google sign-in — one tap, no username screen */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            style={({ pressed, hovered }) => [
              styles.googleButton,
              hovered && !isSigningIn && styles.googleButtonHovered,
              pressed && !isSigningIn && styles.googleButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            {isSigningIn ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: PaletteColors) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    topBar: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    logo: {
      height: 50,
      marginTop: 30,
      width: 120,
    },
    hero: {
      gap: 16,
    },
    title: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 56,
      letterSpacing: 0,
      lineHeight: 58,
      maxWidth: 370,
      textTransform: 'lowercase',
    },
    subtitle: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 16,
      lineHeight: 25,
      maxWidth: 350,
    },
    footer: {
      gap: 12,
    },
    buttonContent: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    // Primary: Google
    googleButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 999,
      justifyContent: 'center',
      minHeight: 56,
    },
    googleButtonHovered: {
      backgroundColor: colors.primaryDark,
    },
    googleButtonPressed: {
      backgroundColor: colors.primaryDark,
      transform: [{ scale: 0.99 }],
    },
    googleButtonText: {
      color: colors.buttonText,
      fontFamily: fontFamily.extraBold,
      fontSize: 17,
    },
    // Secondary: Guest
    guestButton: {
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderColor: colors.inputIdle,
      borderRadius: 999,
      borderWidth: 1.5,
      justifyContent: 'center',
      minHeight: 54,
    },
    guestButtonHovered: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.inputHover,
    },
    guestButtonPressed: {
      borderColor: colors.inputFocus,
      transform: [{ scale: 0.99 }],
    },
    guestButtonText: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 16,
    },
    error: {
      color: colors.error,
      fontFamily: fontFamily.semiBold,
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
    },
    microcopy: {
      color: colors.softMuted,
      fontFamily: fontFamily.semiBold,
      fontSize: 13,
      textAlign: 'center',
    },
  });