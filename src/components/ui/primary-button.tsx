import { usePalette } from '@/context/PaletteContext';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false, loading = false }: Props) {
    const { colors, styles: s } = usePalette()
    const isDisabled = disabled || loading;

    return (
        <Pressable
            disabled={isDisabled}
            onPress={onPress}
            style={({ pressed, hovered }) => [
                s.btn.primary,
                // isDisabled && s.btn.primaryDisabled,
                hovered && !isDisabled && s.btn.primaryHovered,
                pressed && !isDisabled && s.btn.primaryPressed,
            ]}
        >
            {loading
                ? <ActivityIndicator color={colors.buttonText} />
                : <Text style={s.btn.primaryText}>{label}</Text>
            }
        </Pressable>
    );
}

