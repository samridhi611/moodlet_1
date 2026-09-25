import { usePalette } from '@/context/PaletteContext';
import { fontFamily } from '@/theme/design';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Calendar, House, Plus, User, Users } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// ─── Colour helpers ───────────────────────────────────────────────────────────

function hexAlpha(hex: string, alpha: number): string {
    'worklet';
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// ─── FAB (+ rotates to ×) ─────────────────────────────────────────────────────

const FAB = ({
    isSheetOpen,
    isOpen,
    accentColor,
    onPress,
}: {
    isSheetOpen: SharedValue<number>;
    isOpen: boolean;
    accentColor: string;
    onPress: () => void;
}) => {
    const pressScale = useSharedValue(1);

    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));
    const rotateStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${interpolate(isSheetOpen.value, [0, 1], [0, 45])}deg` },
        ],
    }));
    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSheetOpen.value ? 1.04 : 1, { damping: 16, stiffness: 220 }) }],
    }));

    return (
        <View style={styles.fabSlot}>
            <Pressable
                onPress={onPress}
                onPressIn={() => {
                    pressScale.value = withSpring(0.92, { damping: 16, stiffness: 260 });
                }}
                onPressOut={() => {
                    pressScale.value = withSpring(1, { damping: 14, stiffness: 220 });
                }}
                accessibilityRole="button"
                accessibilityLabel="Log mood"
                accessibilityState={{ expanded: isOpen }}
            >
                <Animated.View style={pressStyle}>
                    <Animated.View
                        style={[styles.fab, scaleStyle, { backgroundColor: accentColor, shadowColor: accentColor }]}
                    >
                        <Animated.View style={rotateStyle}>
                            <Plus color="#FFFFFF" size={24} strokeWidth={2.6} />
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Pressable>
        </View>
    );
};

// ─── Nav tab: icon + label + pip indicator ─────────────────────────────────────

const NavTab = ({
    Icon,
    label,
    isActive,
    accentColor,
    chipColor,
    iconColor,
    onPress,
}: {
    Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
    label: string;
    isActive: boolean;
    accentColor: string;
    chipColor: string;
    iconColor: string;
    onPress: () => void;
}) => {
    const pressScale = useSharedValue(1);

    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));
    // The highlight pill fades and scales in behind the icon on its own —
    // the tab itself never resizes, so switching tabs reads as a soft glow
    // moving in rather than the whole row jumping between two sizes.
    const pillStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isActive ? 1 : 0, { duration: 200, easing: Easing.out(Easing.quad) }),
        transform: [
            { scale: withTiming(isActive ? 1 : 0.8, { duration: 200, easing: Easing.out(Easing.quad) }) },
        ],
    }));

    const tintColor = isActive ? accentColor : hexAlpha(iconColor, 0.42);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => {
                pressScale.value = withSpring(0.92, { damping: 16, stiffness: 260 });
            }}
            onPressOut={() => {
                pressScale.value = withSpring(1, { damping: 12, stiffness: 220 });
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${label} tab${isActive ? ', currently selected' : ''}`}
            style={styles.tabPressable}
        >
            <Animated.View style={pressStyle}>
                <View style={styles.navTab}>
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.navTabPill, pillStyle, { backgroundColor: hexAlpha(chipColor, 0.3) }]}
                    />
                    <Icon size={21} color={tintColor} strokeWidth={isActive ? 2.3 : 1.8} />
                    <Text
                        style={[styles.navLabel, { color: tintColor }, isActive && styles.navLabelActive]}
                        numberOfLines={1}
                    >
                        {label}
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    );
};

// ─── Glass island ─────────────────────────────────────────────────────────────
// iOS  → BlurView (true frosted glass)
// Android → semi-transparent tinted fallback

const GlassIsland = ({
    children,
    surfaceColor,
    shadowColor,
}: {
    children: React.ReactNode;
    surfaceColor: string;
    shadowColor: string;
}) => {
    if (Platform.OS === 'ios' || Platform.OS === 'web') {
        return (
            <View style={[styles.islandShadow, { shadowColor }]}>
                <BlurView
                    tint="light"
                    intensity={60}
                    style={[styles.island, { backgroundColor: hexAlpha(surfaceColor, 0.72) }]}
                >
                    {children}
                </BlurView>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.island,
                styles.islandShadow,
                { shadowColor, backgroundColor: hexAlpha(surfaceColor, 0.97) },
            ]}
        >
            {children}
        </View>
    );
};

// ─── Main BottomBar ───────────────────────────────────────────────────────────

export type BottomBarProps = BottomTabBarProps & {
    onOpenMoodSheet: () => void;
    isMoodSheetOpen: boolean;
};

const BottomBar: React.FC<BottomBarProps> = ({
    state,
    navigation,
    onOpenMoodSheet,
    isMoodSheetOpen,
}) => {
    const { tokens, colors } = usePalette();
    const isSheetOpen = useSharedValue(0);

    useEffect(() => {
        isSheetOpen.value = withSpring(isMoodSheetOpen ? 1 : 0, { damping: 14 });
    }, [isMoodSheetOpen]);

    const handleFabPress = useCallback(() => {
        onOpenMoodSheet();
    }, [onOpenMoodSheet]);

    const activeRoute = state.routes[state.index]?.name;
    const tabProps = {
        accentColor: tokens.accent,
        chipColor: tokens.btnBg,
        iconColor: tokens.text,
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            <GlassIsland surfaceColor={colors.surface} shadowColor={tokens.text}>
                <NavTab
                    Icon={House}
                    label="Home"
                    isActive={activeRoute === 'index'}
                    {...tabProps}
                    onPress={() => navigation.navigate('index' as never)}
                />
                <NavTab
                    Icon={Users}
                    label="Friends"
                    isActive={activeRoute === 'friends'}
                    {...tabProps}
                    onPress={() => navigation.navigate('friends' as never)}
                />
                <FAB
                    isSheetOpen={isSheetOpen}
                    isOpen={isMoodSheetOpen}
                    accentColor={tokens.accent}
                    onPress={handleFabPress}
                />
                <NavTab
                    Icon={Calendar}
                    label="Memories"
                    isActive={activeRoute === 'memories'}
                    {...tabProps}
                    onPress={() => navigation.navigate('memories' as never)}
                />
                <NavTab
                    Icon={User}
                    label="Profile"
                    isActive={activeRoute === 'profile'}
                    {...tabProps}
                    onPress={() => navigation.navigate('profile' as never)}
                />
            </GlassIsland>
        </View>
    );
};

export default BottomBar;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingBottom: 26,
        pointerEvents: 'box-none',
    },
    islandShadow: {
        borderRadius: 999,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 12,
    },
    island: {
        width: width * 0.9,
        height: 72,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.85)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
    },
    tabPressable: {
        flex: 1,
        alignItems: 'center',
    },
    navTab: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        gap: 3,
        minWidth: 58,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    navTabPill: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 18,
    },
    navLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: 10.5,
        letterSpacing: 0.1,
    },
    navLabelActive: {
        fontFamily: fontFamily.extraBold,
    },
    fabSlot: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    fab: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
});
