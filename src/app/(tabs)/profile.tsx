import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { useProfile } from '@/context/ProfileContext';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { fontFamily, PaletteColors } from '@/theme/design';
import { PALETTES, PaletteId, PaletteTokens } from '@/theme/theme';
import { Check, LogOut, Palette as PaletteIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// docs/Moodlet_Design_Guide_v1.0.docx §9.2 — palette switch cross-fades
// (250ms ease-in-out) rather than cutting instantly. A true app-wide
// cross-fade would mean animating every hardcoded StyleSheet color in the
// app, which isn't practical — this fades the screen where the switch
// actually happens, which is where the user is looking at the moment.
const FADE_OUT_MS = 120;
const FADE_IN_MS = 130;

// ─── Palette swatch: a tiny live preview of the theme's surfaces (bg, card,
// accent, button) instead of a single flat dot — makes each option actually
// recognizable before you tap it. ────────────────────────────────────────────

const PaletteSwatch = ({
  tokens,
  selected,
  borderColor,
  onSelect,
}: {
  tokens: PaletteTokens;
  selected: boolean;
  borderColor: string;
  onSelect: () => void;
}) => {
  const pressScale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    borderWidth: withTiming(selected ? 2.5 : 1, { duration: 180 }),
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(selected ? 1 : 0, { duration: 150 }),
    transform: [{ scale: withSpring(selected ? 1 : 0.4, { damping: 12 }) }],
  }));

  return (
    <Pressable
      onPress={onSelect}
      onPressIn={() => {
        pressScale.value = withSpring(0.96, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${tokens.name} palette${selected ? ', selected' : ''}`}
      style={swatchStyles.wrap}
    >
      <Animated.View
        style={[
          swatchStyles.card,
          pressStyle,
          ringStyle,
          { borderColor: selected ? tokens.accent : borderColor },
        ]}
      >
        <View style={[swatchStyles.preview, { backgroundColor: tokens.bg }]}>
          <View style={[swatchStyles.previewCard, { backgroundColor: tokens.cardBg }]} />
          <View style={[swatchStyles.previewDot, { backgroundColor: tokens.accent }]} />
          <View style={[swatchStyles.previewPill, { backgroundColor: tokens.btnBg }]} />
        </View>
        <Animated.View style={[swatchStyles.badge, badgeStyle, { backgroundColor: tokens.accent }]}>
          <Check size={11} color="#FFFFFF" strokeWidth={3.5} />
        </Animated.View>
      </Animated.View>
      <Text
        style={[swatchStyles.label, { color: selected ? tokens.accent : tokens.text }]}
        numberOfLines={1}
      >
        {tokens.name}
      </Text>
    </Pressable>
  );
};

const swatchStyles = StyleSheet.create({
  wrap: {
    width: '31%',
    alignItems: 'center',
    gap: 8,
  },
  card: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  preview: {
    flex: 1,
  },
  previewCard: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: '52%',
    height: '46%',
    borderRadius: 9,
  },
  previewDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  previewPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: '62%',
    height: 12,
    borderRadius: 999,
  },
  badge: {
    position: 'absolute',
    bottom: 7,
    right: 7,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
  },
});

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

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
              <PaletteIcon size={15} color={colors.accentText} strokeWidth={2.2} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.sectionTitle}>Palette</Text>
              <Text style={styles.sectionCopy}>
                Your palette is your identity — switch it any time, it never changes your mood colours.
              </Text>
            </View>
          </View>
          <View style={styles.paletteGrid}>
            {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
              <PaletteSwatch
                key={id}
                tokens={PALETTES[id]}
                selected={id === paletteId}
                borderColor={colors.border}
                onSelect={() => handleSelectPalette(id)}
              />
            ))}
          </View>
        </View>

        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.lightPress]}
        >
          <View style={[styles.sectionIcon, styles.signOutIcon]}>
            <LogOut size={15} color="#B42318" strokeWidth={2.2} />
          </View>
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
    flex1: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 24,
      padding: 18,
      gap: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    sectionIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: 10,
    },
    sectionTitle: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 16,
      marginBottom: 3,
    },
    sectionCopy: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 13,
      lineHeight: 19,
    },
    paletteGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '3.5%',
      rowGap: 16,
    },
    signOutButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      minHeight: 58,
      paddingHorizontal: 18,
    },
    signOutIcon: {
      backgroundColor: 'rgba(180,35,24,0.1)',
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
