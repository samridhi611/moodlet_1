import { useEntries } from '@/context/EntriesContext';
import { usePalette } from '@/context/PaletteContext';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { fontFamily } from '@/theme/design';
import * as Haptics from 'expo-haptics';
import { Flame } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AUTO_DISMISS_MS = 2400;
const PARTICLE_COUNT = 24;

// docs/Moodlet_Design_Guide_v1.0.docx §9.2 — full-screen confetti burst in
// palette accent colour + badge, 600ms ease-out.
const ConfettiParticle = ({ delay, colors }: { delay: number; colors: string[] }) => {
    const angle = useMemo(() => Math.random() * Math.PI * 2, []);
    const distance = useMemo(() => 90 + Math.random() * 160, []);
    const color = useMemo(() => colors[Math.floor(Math.random() * colors.length)], [colors]);
    const size = useMemo(() => 6 + Math.random() * 6, []);

    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(
            delay,
            withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
        );
    }, [delay, progress]);

    const style = useAnimatedStyle(() => ({
        opacity: 1 - progress.value,
        transform: [
            { translateX: Math.cos(angle) * distance * progress.value },
            { translateY: Math.sin(angle) * distance * progress.value + progress.value * 60 },
            { scale: 1 - progress.value * 0.4 },
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.particle,
                { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
                style,
            ]}
        />
    );
};

export function StreakConfetti() {
    const { milestone, clearMilestone } = useEntries();
    const { colors, tokens } = usePalette();
    const reduceMotion = useReduceMotion();

    const badgeScale = useSharedValue(0.6);
    const badgeOpacity = useSharedValue(0);

    useEffect(() => {
        if (milestone == null) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // docs/Moodlet_Design_Guide_v1.0.docx §9.1 — reduce motion disables
        // the spring bounce and particle burst; the badge still appears, just
        // without animation.
        if (reduceMotion) {
            badgeScale.value = 1;
            badgeOpacity.value = 1;
        } else {
            badgeScale.value = withSequence(
                withTiming(1.06, { duration: 260, easing: Easing.out(Easing.back(1.6)) }),
                withTiming(1, { duration: 160 }),
            );
            badgeOpacity.value = withTiming(1, { duration: 220 });
        }

        const timer = setTimeout(() => {
            badgeOpacity.value = reduceMotion ? 0 : withTiming(0, { duration: 220 });
            setTimeout(clearMilestone, reduceMotion ? 0 : 220);
        }, AUTO_DISMISS_MS);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [milestone, reduceMotion]);

    const badgeStyle = useAnimatedStyle(() => ({
        opacity: badgeOpacity.value,
        transform: [{ scale: badgeScale.value }],
    }));

    if (milestone == null) return null;

    const particleColors = [tokens.accent, colors.primaryDark, colors.white];

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Pressable
                style={StyleSheet.absoluteFill}
                onPress={clearMilestone}
                accessibilityLabel={`${milestone} day streak celebration, tap to dismiss`}
            >
                {!reduceMotion && (
                    <View style={styles.burstOrigin}>
                        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                            <ConfettiParticle key={i} delay={(i % 6) * 30} colors={particleColors} />
                        ))}
                    </View>
                )}

                <Animated.View
                    style={[styles.badge, badgeStyle, { backgroundColor: colors.background, borderColor: tokens.accent }]}
                >
                    <View style={[styles.badgeIcon, { backgroundColor: colors.primarySoft }]}>
                        <Flame size={26} color={colors.primaryDark} strokeWidth={2.3} />
                    </View>
                    <Text style={[styles.badgeTitle, { color: colors.ink }]}>{milestone}-day streak!</Text>
                    <Text style={[styles.badgeCopy, { color: colors.muted }]}>Keep the momentum going.</Text>
                </Animated.View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    burstOrigin: {
        position: 'absolute',
        left: SCREEN_WIDTH / 2,
        top: SCREEN_HEIGHT * 0.38,
    },
    particle: {
        position: 'absolute',
    },
    badge: {
        position: 'absolute',
        left: 32,
        right: 32,
        top: SCREEN_HEIGHT * 0.38 - 70,
        borderRadius: 20,
        borderWidth: 1.5,
        alignItems: 'center',
        gap: 6,
        paddingVertical: 22,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    badgeIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    badgeTitle: {
        fontFamily: fontFamily.extraBold,
        fontSize: 18,
    },
    badgeCopy: {
        fontFamily: fontFamily.medium,
        fontSize: 13,
    },
});
