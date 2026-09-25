import { usePalette } from '@/context/PaletteContext';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { ReactNode, useEffect, useState } from 'react';
import { DimensionValue, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const OPEN_SPRING = { damping: 20, stiffness: 220, mass: 0.9 };
const CLOSE_TIMING = { duration: 200, easing: Easing.out(Easing.cubic) };

/**
 * Bottom-sheet chrome (backdrop + panel) shared by CheckInSheet and
 * EditEntrySheet. Unlike RN's built-in `Modal` animationType, the backdrop
 * fades independently of the panel sliding/fading in, and — since Modal
 * unmounts synchronously on `visible={false}` — this stays mounted through
 * the close animation and only hides the native Modal once it finishes, so
 * the sheet is never yanked off screen mid-transition.
 */
export function SheetModal({
    visible,
    onRequestClose,
    children,
    minHeight = '55%',
    maxHeight = '88%',
}: {
    visible: boolean;
    onRequestClose: () => void;
    children: ReactNode;
    minHeight?: DimensionValue;
    maxHeight?: DimensionValue;
}) {
    const { colors } = usePalette();
    const reduceMotion = useReduceMotion();
    const [rendered, setRendered] = useState(visible);
    const progress = useSharedValue(visible ? 1 : 0);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            progress.value = reduceMotion ? 1 : withSpring(1, OPEN_SPRING);
            return;
        }
        if (!rendered) return;
        if (reduceMotion) {
            progress.value = 0;
            setRendered(false);
            return;
        }
        progress.value = withTiming(0, CLOSE_TIMING, (finished) => {
            if (finished) runOnJS(setRendered)(false);
        });
        // `rendered` intentionally excluded — it's only read to short-circuit
        // an already-closed sheet, not to retrigger the close animation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, reduceMotion]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));
    const sheetStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ translateY: (1 - progress.value) * 24 }],
    }));

    if (!rendered) return null;

    return (
        <Modal visible transparent animationType="none" onRequestClose={onRequestClose} statusBarTranslucent>
            <View style={styles.backdrop}>
                <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, backdropStyle]} />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onRequestClose}
                    accessibilityLabel="Close"
                    accessibilityRole="button"
                />
                <Animated.View
                    style={[styles.sheet, sheetStyle, { backgroundColor: colors.background, minHeight, maxHeight }]}
                >
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    scrim: {
        backgroundColor: 'rgba(12,12,18,0.4)',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 28,
    },
    handle: {
        alignSelf: 'center',
        width: 34,
        height: 5,
        borderRadius: 3,
        marginBottom: 14,
        opacity: 0.6,
    },
});
