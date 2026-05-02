import { useMemo } from 'react';

import { usePalette } from '@/context/PaletteContext';
import { createPaletteColors, fontFamily } from '@/theme/design';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    onPress: () => void;
    label?: string;
};

export function BackButton({ onPress, label = 'Back' }: Props) {
    const { tokens, colors, styles: s } = usePalette();
    const styles = useMemo(() => createScreenStyles(colors), [colors]);
    return (
        <Pressable
            onPress={onPress}
            style={() => [
                styles.button,
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

const createScreenStyles = (colors: ReturnType<typeof createPaletteColors>) =>
    StyleSheet.create({
        button: {
            borderBottomColor: 'transparent',
            borderBottomWidth: 1,
            paddingVertical: 8,
            alignSelf: 'flex-start',
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