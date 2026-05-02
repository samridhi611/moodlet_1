// BottomBar.tsx
import React from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import Animated, {
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

// Lucide icons
import {
    Calendar,
    CloudUpload,
    LayoutGrid,
    Paintbrush,
    Plus,
    Smile,
    Users,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

/* ================= FAB (+ → X) ================= */

const AnimatedPlus = ({ isOpen }: { isOpen: SharedValue<number> }) => {
    const style = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotate: `${interpolate(isOpen.value, [0, 1], [0, 45])}deg`,
                },
            ],
        };
    });

    return (
        <Animated.View style={[styles.fab, style]}>
            <Plus color="#fff" size={26} strokeWidth={2.5} />
        </Animated.View>
    );
};

/* ================= RADIAL ITEM ================= */

type RadialItemProps = {
    index: number;
    total: number;
    isOpen: SharedValue<number>;
    Icon: any;
    onPress: () => void;
};

const RadialItem: React.FC<RadialItemProps> = ({
    index,
    total,
    isOpen,
    Icon,
    onPress,
}) => {
    const RADIUS = 100;

    const style = useAnimatedStyle(() => {
        const start = -Math.PI;           // 0 degrees
        const end = 0;

        const angle = start + (index / (total - 1)) * (end - start);

        const progress = isOpen.value;

        const x = RADIUS * Math.cos(angle) * progress;
        const y = RADIUS * Math.sin(angle) * progress;

        return {
            transform: [
                { translateX: withSpring(x) },
                { translateY: withSpring(y - 20) },
                { scale: withSpring(progress) },
            ],
            opacity: withSpring(progress),
        };
    });

    return (
        <Animated.View style={[styles.actionWrapper, style]}>
            <Pressable style={styles.actionBtn} onPress={onPress}>
                <Icon size={20} color="#fff" strokeWidth={2} />
            </Pressable>
        </Animated.View>
    );
};

/* ================= FLOATING MENU ================= */

const FloatingActions = ({
    isOpen,
    navigation,
}: {
    isOpen: SharedValue<number>;
    navigation: BottomTabBarProps["navigation"];
}) => {
    const actions = [
        { icon: CloudUpload, route: "/insights" },
        { icon: Smile, route: "/mood" },
        { icon: Paintbrush, route: "/theme" },
        { icon: LayoutGrid, route: "/widgets" },
    ];

    return (
        <View style={styles.floatingContainer}>
            {actions.map((item, i) => (
                <RadialItem
                    key={i}
                    index={i}
                    total={actions.length}
                    isOpen={isOpen}
                    Icon={item.icon}
                    onPress={() => {
                        navigation.navigate(item.route as never);
                        isOpen.value = 0; // close menu
                    }}
                />
            ))}
        </View>
    );
};

/* ================= MAIN TAB BAR ================= */

const BottomBar: React.FC<BottomTabBarProps> = ({
    state,
    navigation,
}) => {
    const isOpen = useSharedValue(0);

    const toggle = () => {
        isOpen.value = withSpring(isOpen.value ? 0 : 1);
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Floating radial menu */}
            <FloatingActions isOpen={isOpen} navigation={navigation} />

            {/* Bottom bar */}
            <View style={styles.bar}>
                {/* Calendar */}
                <Pressable
                    onPress={() => navigation.navigate("index")}
                    style={styles.sideBtn}
                >
                    <Calendar size={22} color="#fff" />
                </Pressable>

                {/* FAB */}
                <Pressable onPress={toggle}>
                    <AnimatedPlus isOpen={isOpen} />
                </Pressable>

                {/* Friends */}
                <Pressable
                    onPress={() => navigation.navigate("explore")}
                    style={styles.sideBtn}
                >
                    <Users size={22} color="#fff" />
                </Pressable>
            </View>
        </View>
    );
};

export default BottomBar;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 30,
        width: "100%",
        alignItems: "center",
    },

    bar: {
        width: width * 0.75,
        height: 70,
        borderRadius: 40,
        backgroundColor: "#6C4AB6",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 30,
        elevation: 10,
    },

    sideBtn: {
        padding: 10,
    },

    fab: {
        width: 65,
        height: 65,
        borderRadius: 32,
        backgroundColor: "#ff6ec7",
        justifyContent: "center",
        alignItems: "center",
    },

    floatingContainer: {
        position: "absolute",
        bottom: 35,
        alignItems: "center",
    },

    actionWrapper: {
        position: "absolute",
    },

    actionBtn: {
        width: 65,
        height: 65,
        borderRadius: 32,
        backgroundColor: "#ff6ec7",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
    },
});
