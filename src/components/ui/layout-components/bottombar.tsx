import { usePalette } from '@/context/PaletteContext';
import { fontFamily } from '@/theme/design';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Calendar, House, Plus, User, Users } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── FAB (+ rotates to ×) ─────────────────────────────────────────────────────
// The one spot of colour on an otherwise neutral bar — raised above the top
// edge so logging a mood always reads as the primary action, not just another tab.

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
        transform: [{ scale: withSpring(isSheetOpen.value ? 1.03 : 1, { damping: 20, stiffness: 200 }) }],
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

// ─── Nav tab: icon + label, plain colour/weight contrast (no chip, no pop) ─────

const NavTab = ({
    Icon,
    label,
    isActive,
    activeColor,
    inactiveColor,
    accentColor,
    onPress,
}: {
    Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
    label: string;
    isActive: boolean;
    activeColor: string;
    inactiveColor: string;
    accentColor: string;
    onPress: () => void;
}) => {
    const pressScale = useSharedValue(1);

    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));
    // Fixed-size dash so it never shifts the icon below it — only its
    // opacity/width animate in, no pop.
    const dashStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isActive ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) }),
        transform: [{ scaleX: withTiming(isActive ? 1 : 0.4, { duration: 220, easing: Easing.out(Easing.cubic) }) }],
    }));

    const tintColor = isActive ? activeColor : inactiveColor;

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => {
                pressScale.value = withSpring(0.9, { damping: 16, stiffness: 260 });
            }}
            onPressOut={() => {
                pressScale.value = withSpring(1, { damping: 12, stiffness: 220 });
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${label} tab${isActive ? ', currently selected' : ''}`}
            style={styles.tabPressable}
        >
            <Animated.View style={[styles.navTab, pressStyle]}>
                <Animated.View
                    pointerEvents="none"
                    style={[styles.activeDash, dashStyle, { backgroundColor: accentColor }]}
                />
                <Icon size={22} color={tintColor} strokeWidth={isActive ? 2.4 : 1.7} />
                <Text
                    style={[styles.navLabel, { color: tintColor }, isActive && styles.navLabelActive]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

// ─── Main BottomBar ───────────────────────────────────────────────────────────
// Flush to the bottom edge, rounded only at the top — a plain surface rather
// than a floating glass pill, so it reads as calm and structural.

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
    const insets = useSafeAreaInsets();
    const isSheetOpen = useSharedValue(0);

    useEffect(() => {
        isSheetOpen.value = withSpring(isMoodSheetOpen ? 1 : 0, { damping: 14 });
    }, [isMoodSheetOpen]);

    const handleFabPress = useCallback(() => {
        onOpenMoodSheet();
    }, [onOpenMoodSheet]);

    const activeRoute = state.routes[state.index]?.name;
    const tabProps = {
        activeColor: colors.ink,
        inactiveColor: colors.muted,
        accentColor: tokens.accent,
    };

    return (
        <View
            style={[
                styles.bar,
                {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    shadowColor: tokens.text,
                    paddingBottom: Math.max(insets.bottom, 14),
                },
            ]}
        >
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
        </View>
    );
};

export default BottomBar;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    bar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: 14,
        paddingHorizontal: 10,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 10,
    },
    tabPressable: {
        flex: 1,
        alignItems: 'center',
    },
    navTab: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 4,
    },
    activeDash: {
        width: 18,
        height: 3,
        borderRadius: 999,
        marginBottom: 4,
    },
    navLabel: {
        fontFamily: fontFamily.medium,
        fontSize: 11,
        letterSpacing: 0.1,
    },
    navLabelActive: {
        fontFamily: fontFamily.extraBold,
    },
    fabSlot: {
        width: 60,
        alignItems: 'center',
        marginTop: -30,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 8,
    },
});
