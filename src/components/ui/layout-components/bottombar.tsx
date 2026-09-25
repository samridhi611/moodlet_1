import { usePalette } from '@/context/PaletteContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Calendar, House, Plus, User, Users } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
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
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// ─── FAB (+ rotates to ×) ─────────────────────────────────────────────────────

const FAB = ({
    isSheetOpen,
    isOpen,
    accentColor,
    iconColor,
    onPress,
}: {
    isSheetOpen: SharedValue<number>;
    isOpen: boolean;
    accentColor: string;
    iconColor: string;
    onPress: () => void;
}) => {
    const rotateStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${interpolate(isSheetOpen.value, [0, 1], [0, 45])}deg` },
        ],
    }));
    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSheetOpen.value ? 1.06 : 1, { damping: 12 }) }],
    }));

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Log mood"
            accessibilityState={{ expanded: isOpen }}
        >
            <Animated.View
                style={[styles.fab, scaleStyle, { backgroundColor: accentColor, shadowColor: accentColor }]}
            >
                <Animated.View style={rotateStyle}>
                    <Plus color={iconColor} size={22} strokeWidth={2.5} />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

// ─── Nav tab with pip indicator ───────────────────────────────────────────────

const NavTab = ({
    Icon,
    label,
    isActive,
    accentColor,
    iconColor,
    onPress,
}: {
    Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
    label: string;
    isActive: boolean;
    accentColor: string;
    iconColor: string;
    onPress: () => void;
}) => {
    const bgStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(
            isActive ? hexAlpha(accentColor, 0.22) : 'transparent',
            { duration: 200 }
        ),
    }));
    const pipStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isActive ? 1 : 0, { duration: 180 }),
        transform: [{ scale: withSpring(isActive ? 1 : 0.2, { damping: 11 }) }],
    }));

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${label} tab${isActive ? ', currently selected' : ''}`}
            style={styles.tabPressable}
        >
            <Animated.View style={[styles.navTab, bgStyle]}>
                <Icon
                    size={21}
                    color={isActive ? accentColor : hexAlpha(iconColor, 0.45)}
                    strokeWidth={isActive ? 2.1 : 1.7}
                />
                <Animated.View style={[styles.pip, pipStyle, { backgroundColor: accentColor }]} />
            </Animated.View>
        </Pressable>
    );
};

// ─── Glass island ─────────────────────────────────────────────────────────────
// iOS  → BlurView (true frosted glass)
// Android → semi-transparent tinted fallback

const GlassIsland = ({
    children,
    accentColor,
}: {
    children: React.ReactNode;
    accentColor: string;
}) => {
    const sharedStyle = {
        borderColor: hexAlpha(accentColor, 0.3),
        shadowColor: accentColor,
    };

    if (Platform.OS === 'ios' || Platform.OS === 'web') {
        return (
            <BlurView
                tint="light"
                intensity={40}
                style={[styles.island, sharedStyle, { backgroundColor: hexAlpha(accentColor, 0.15) }]}
            >
                {children}
            </BlurView>
        );
    }

    return (
        <View style={[styles.island, sharedStyle, { backgroundColor: hexAlpha(accentColor, 0.82) }]}>
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
    const { tokens } = usePalette();
    const isSheetOpen = useSharedValue(0);

    useEffect(() => {
        isSheetOpen.value = withSpring(isMoodSheetOpen ? 1 : 0, { damping: 14 });
    }, [isMoodSheetOpen]);

    const handleFabPress = useCallback(() => {
        onOpenMoodSheet();
    }, [onOpenMoodSheet]);

    const activeRoute = state.routes[state.index]?.name;
    const accentColor = tokens.accent;
    const iconColor = tokens.text;

    return (
        <View style={styles.container} pointerEvents="box-none">
            <GlassIsland accentColor={accentColor}>
                <NavTab
                    Icon={House}
                    label="Home"
                    isActive={activeRoute === 'index'}
                    accentColor={accentColor}
                    iconColor={iconColor}
                    onPress={() => navigation.navigate('index' as never)}
                />
                <NavTab
                    Icon={Users}
                    label="Friends"
                    isActive={activeRoute === 'friends'}
                    accentColor={accentColor}
                    iconColor={iconColor}
                    onPress={() => navigation.navigate('friends' as never)}
                />
                <FAB
                    isSheetOpen={isSheetOpen}
                    isOpen={isMoodSheetOpen}
                    accentColor={accentColor}
                    iconColor={iconColor}
                    onPress={handleFabPress}
                />
                <NavTab
                    Icon={Calendar}
                    label="Memories"
                    isActive={activeRoute === 'memories'}
                    accentColor={accentColor}
                    iconColor={iconColor}
                    onPress={() => navigation.navigate('memories' as never)}
                />
                <NavTab
                    Icon={User}
                    label="Profile"
                    isActive={activeRoute === 'profile'}
                    accentColor={accentColor}
                    iconColor={iconColor}
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
    island: {
        width: width * 0.88,
        height: 66,
        borderRadius: 26,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 14,
        overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
    },
    tabPressable: {
        flex: 1,
        alignItems: 'center',
    },
    navTab: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        gap: 3,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    pip: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    fab: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        marginHorizontal: 4,
    },
});