import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { useProfile } from '@/context/ProfileContext';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { fontFamily, PaletteColors } from '@/theme/design';
import { PALETTES, PaletteId } from '@/theme/theme';
import { Check, LogOut } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// docs/Moodlet_Design_Guide_v1.0.docx §9.2 — palette switch cross-fades
// (250ms ease-in-out) rather than cutting instantly. A true app-wide
// cross-fade would mean animating every hardcoded StyleSheet color in the
// app, which isn't practical — this fades the screen where the switch
// actually happens, which is where the user is looking at the moment.
const FADE_OUT_MS = 120;
const FADE_IN_MS = 130;

export default function ProfileScreen() {
  const { username } = useProfile();
  const { signOut } = useAuth();
  const { paletteId, colors, setPalette } = usePalette();
  const reduceMotion = useReduceMotion();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fadeOpacity = useSharedValue(1);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeOpacity.value }));

  const handleSelectPalette = (id: PaletteId) => {
    if (id === paletteId) return;

    if (reduceMotion) {
      setPalette(id);
      return;
    }

    fadeOpacity.value = withTiming(0.4, { duration: FADE_OUT_MS, easing: Easing.inOut(Easing.quad) });
    setTimeout(() => {
      setPalette(id);
      fadeOpacity.value = withTiming(1, { duration: FADE_IN_MS, easing: Easing.inOut(Easing.quad) });
    }, FADE_OUT_MS);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView contentContainerStyle={styles.container} style={fadeStyle}>
        <View style={styles.header}>
          <Text style={styles.overline}>Your space</Text>
          <Text style={styles.greeting}>{username ?? 'you'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Palette</Text>
          <Text style={styles.sectionCopy}>
            Your palette is your identity — switch it any time, it never changes your mood colours.
          </Text>
          <View style={styles.paletteGrid}>
            {(Object.keys(PALETTES) as PaletteId[]).map((id) => {
              const tokens = PALETTES[id];
              const selected = id === paletteId;
              return (
                <Pressable
                  key={id}
                  onPress={() => handleSelectPalette(id)}
                  style={[styles.swatch, { backgroundColor: tokens.bg, borderColor: tokens.accent }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${tokens.name} palette`}
                >
                  <View style={[styles.swatchDot, { backgroundColor: tokens.accent }]}>
                    {selected && <Check size={14} color={tokens.btnText} strokeWidth={3} />}
                  </View>
                  <Text style={[styles.swatchLabel, { color: colors.ink }]}>{tokens.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.lightPress]}
        >
          <LogOut size={16} color={colors.ink} strokeWidth={2} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </Animated.ScrollView>
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
      gap: 28,
      padding: 22,
      paddingTop: 28,
      paddingBottom: 140,
    },
    header: {
      gap: 5,
    },
    overline: {
      color: colors.accentText,
      fontFamily: fontFamily.extraBold,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    greeting: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 32,
      lineHeight: 38,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 16,
    },
    sectionCopy: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 14,
      lineHeight: 20,
    },
    paletteGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 6,
    },
    swatch: {
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1.5,
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 14,
      width: '30%',
    },
    swatchDot: {
      alignItems: 'center',
      borderRadius: 999,
      height: 28,
      justifyContent: 'center',
      width: 28,
    },
    swatchLabel: {
      fontFamily: fontFamily.bold,
      fontSize: 12,
    },
    signOutButton: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1.5,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      minHeight: 52,
    },
    lightPress: {
      opacity: 0.72,
    },
    signOutText: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 15,
    },
  });
