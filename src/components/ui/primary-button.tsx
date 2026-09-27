import { usePalette } from '@/context/PaletteContext';
import { usePressState } from '@/hooks/use-press-state';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    /** Optional leading element, e.g. a brand mark. Hidden while loading. */
    icon?: ReactNode;
};

export function PrimaryButton({ label, onPress, disabled = false, loading = false, icon }: Props) {
    const { colors, styles: s } = usePalette()
    const { pressed, hovered, handlers } = usePressState();
    const isDisabled = disabled || loading;

    return (
        <Pressable
            disabled={isDisabled}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            {...handlers}
            // NOTE: an array, never a function — see usePressState for why.
            style={[
                s.btn.primary,
                disabled && !loading && s.btn.primaryDisabled,
                hovered && !isDisabled && s.btn.primaryHovered,
                pressed && !isDisabled && s.btn.primaryPressed,
            ]}
        >
            {loading
                ? <ActivityIndicator color={colors.buttonText} />
                : <>
                    {icon}
                    <Text style={s.btn.primaryText}>{label}</Text>
                </>
            }
        </Pressable>
    );
}
