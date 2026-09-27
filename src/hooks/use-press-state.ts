import { useMemo, useState } from 'react';

/**
 * Tracks press/hover state for a Pressable.
 *
 * Why not `style={({ pressed }) => ...}`? NativeWind's css-interop wraps every
 * react-native component and treats the `style` prop as inline rules. It can
 * only read objects and arrays — a style *function* is spread with `{...fn}`,
 * which yields `{}`, so the whole style is silently dropped. Passing a plain
 * array plus these handlers keeps the styling intact.
 */
export function usePressState() {
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handlers = useMemo(
        () => ({
            onPressIn: () => setPressed(true),
            onPressOut: () => setPressed(false),
            onHoverIn: () => setHovered(true),
            onHoverOut: () => setHovered(false),
        }),
        [],
    );

    return { pressed, hovered, handlers };
}
