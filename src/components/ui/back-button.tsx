import { usePalette } from '@/context/PaletteContext';
import { createPaletteColors, fontFamily } from '@/theme/design';
import { ArrowLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    onPress: () => void;
    label?: string;
};

export function BackButton({ onPress, label = 'Back' }: Props) {
    const { tokens } = usePalette();
    const colors = useMemo(() => createPaletteColors(tokens), [tokens]);
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed, hovered }) => [
                styles.button,
                hovered && styles.hovered,
                pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View style={styles.content}>
                <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
                <Text style={styles.label}>{label}</Text>
            </View>
        </Pressable>
    );
}

const createStyles = (colors: ReturnType<typeof createPaletteColors>) =>
    StyleSheet.create({
        button: {
            borderBottomColor: 'transparent',
            borderBottomWidth: 1,
            paddingVertical: 8,
            alignSelf: 'flex-start',
        },
        hovered: {
            borderBottomColor: colors.inputHover,
        },
        pressed: {
            borderBottomColor: colors.ink,
        },
        content: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
        },
        label: {
            color: colors.ink,
            fontFamily: fontFamily.bold,
            fontSize: 14,
        },
    });