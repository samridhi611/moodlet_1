import { usePalette } from '@/context/PaletteContext';
import { createPaletteColors, fontFamily } from '@/theme/design';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type Props = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false, loading = false }: Props) {
    const { tokens } = usePalette();
    const colors = useMemo(() => createPaletteColors(tokens), [tokens]);
    const styles = useMemo(() => createStyles(colors), [colors]);
    const isDisabled = disabled || loading;

    return (
        <Pressable
            disabled={isDisabled}
            onPress={onPress}
            style={({ pressed, hovered }) => [
                styles.button,
                isDisabled && styles.disabled,
                hovered && !isDisabled && styles.hovered,
                pressed && !isDisabled && styles.pressed,
            ]}
        >
            {loading
                ? <ActivityIndicator color={colors.buttonText} />
                : <Text style={styles.label}>{label}</Text>
            }
        </Pressable>
    );
}

const createStyles = (colors: ReturnType<typeof createPaletteColors>) =>
    StyleSheet.create({
        button: {
            alignItems: 'center',
            backgroundColor: colors.primary,
            borderRadius: 999,
            justifyContent: 'center',
            minHeight: 56,
        },
        hovered: {
            backgroundColor: colors.primaryDark,
        },
        pressed: {
            backgroundColor: colors.primaryDark,
            transform: [{ scale: 0.99 }],
        },
        disabled: {
            opacity: 0.42,
        },
        label: {
            color: colors.buttonText,
            fontFamily: fontFamily.extraBold,
            fontSize: 16,
        },
    });