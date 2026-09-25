import { fontFamily, PaletteColors } from '@/theme/design';
import { SharedStyles } from '@/theme/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentType, ReactNode, useMemo, useState } from 'react';
import {
    Animated,
    Pressable,
    PressableProps,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

// Ported from moodlet/src/components/ui.tsx (Widget/PressableScale/Chip),
// reworked to be palette-driven: instead of importing a static `colors`
// object, every component here takes `colors` (and, for card chrome/type
// tokens, `styles`) as props — callers get both from usePalette() and pass
// them down. AuroraBackground/Blob deliberately weren't ported: that's
// moodlet's dark-only background effect and doesn't fit a themeable app.

/** Pressable that squishes on touch — the tactile feel modern apps have. */
export function PressableScale({
    children,
    style,
    scaleTo = 0.94,
    ...rest
}: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle>; scaleTo?: number }) {
    const [scale] = useState(() => new Animated.Value(1));
    const spring = (to: number) =>
        Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 8 }).start();

    return (
        <Pressable onPressIn={() => spring(scaleTo)} onPressOut={() => spring(1)} {...rest}>
            <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
        </Pressable>
    );
}

type WidgetProps = {
    title?: string;
    kicker?: string;
    right?: ReactNode;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    /** Two-stop tint wash behind the card content, e.g. `[mood.tintBg, mood.tintAccent]`. */
    tint?: [string, string];
    colors: PaletteColors;
    styles: SharedStyles;
};

/** Bento card every in-app "widget" sits inside. Chrome comes from `styles.card.base`
 *  (src/theme/styles.ts) and text from `styles.type.*` tokens where they fit. */
export function Widget({ title, kicker, right, children, style, tint, colors, styles: shared }: WidgetProps) {
    const local = useMemo(() => createLocalStyles(colors), [colors]);

    return (
        <View style={[shared.card.base, style]}>
            {tint && (
                <LinearGradient
                    colors={[tint[0] + '55', tint[1] + '14']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
            )}
            {(title || kicker || right) && (
                <View style={local.header}>
                    <View style={{ flex: 1 }}>
                        {kicker && <Text style={shared.type.kicker}>{kicker}</Text>}
                        {title && <Text style={local.title}>{title}</Text>}
                    </View>
                    {right}
                </View>
            )}
            {children}
        </View>
    );
}

export function Chip({ label, color, colors }: { label: string; color?: string; colors: PaletteColors }) {
    const c = color ?? colors.accent;
    return (
        <View style={[chipStyles.chip, { backgroundColor: c + '22', borderColor: c + '55' }]}>
            <View style={[chipStyles.dot, { backgroundColor: c }]} />
            <Text style={[chipStyles.text, { color: c }]}>{label}</Text>
        </View>
    );
}

type MoodLike = {
    tintBg: string;
    tintAccent: string;
    Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

/** A mood's icon on a two-stop gradient ring — the app's "this is the logged
 *  answer" motif (vs. a plain muted circle for an unselected option). The icon
 *  always sits on a solid `colors.surface` disc inside the ring, never directly
 *  on the gradient, so contrast holds regardless of how pale a palette's tints are. */
export function MoodOrb({
    mood,
    colors,
    size = 52,
    iconSize,
}: {
    mood: MoodLike;
    colors: PaletteColors;
    size?: number;
    iconSize?: number;
}) {
    const Icon = mood.Icon;
    const ringWidth = Math.max(3, Math.round(size * 0.07));

    return (
        <LinearGradient
            colors={[mood.tintBg, mood.tintAccent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                padding: ringWidth,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <View
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: size / 2,
                    backgroundColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon size={iconSize ?? Math.round(size * 0.42)} color={mood.tintAccent} strokeWidth={2.2} />
            </View>
        </LinearGradient>
    );
}

const createLocalStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
        title: {
            fontFamily: fontFamily.extraBold,
            fontSize: 20,
            color: colors.ink,
            letterSpacing: -0.4,
        },
    });

const chipStyles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    text: { fontFamily: fontFamily.semiBold, fontSize: 12 },
});
