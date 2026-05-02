import { usePalette } from '@/context/PaletteContext';
import { createPaletteColors, fontFamily } from '@/theme/design';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    error?: string | null;
    disabled?: boolean;
};

export function UsernameInput({ value, onChange, onSubmit, error, disabled }: Props) {
    const { tokens } = usePalette();
    const colors = useMemo(() => createPaletteColors(tokens), [tokens]);
    const styles = useMemo(() => createStyles(colors), [colors]);

    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <Text style={[styles.label, isFocused && styles.labelFocused]}>Username</Text>
            <Pressable
                disabled={disabled}
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                onPress={() => inputRef.current?.focus()}
                style={[
                    styles.frame,
                    isHovered && styles.hovered,
                    isFocused && styles.focused,
                    Boolean(error) && styles.errored,
                ]}
            >
                <TextInput
                    ref={inputRef}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!disabled}
                    maxLength={32}
                    onBlur={() => setIsFocused(false)}
                    onChangeText={onChange}
                    onFocus={() => setIsFocused(true)}
                    onSubmitEditing={onSubmit}
                    placeholder="e.g. sam"
                    placeholderTextColor={colors.softMuted}
                    returnKeyType="done"
                    style={styles.input}
                    value={value}
                />
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
    );
}

const createStyles = (colors: ReturnType<typeof createPaletteColors>) =>
    StyleSheet.create({
        label: {
            color: colors.softMuted,
            fontFamily: fontFamily.bold,
            fontSize: 13,
            marginBottom: 8,
        },
        labelFocused: {
            color: colors.ink,
        },
        frame: {
            backgroundColor: 'transparent',
            borderColor: colors.inputIdle,
            borderRadius: 8,
            borderWidth: 1.5,
            justifyContent: 'center',
            minHeight: 58,
        },
        hovered: {
            borderColor: colors.inputHover,
        },
        focused: {
            borderColor: colors.inputFocus,
            borderWidth: 2,
        },
        errored: {
            borderColor: colors.error,
        },
        input: {
            color: colors.ink,
            fontFamily: fontFamily.bold,
            fontSize: 18,
            paddingHorizontal: 15,
            paddingVertical: 0,
        },
        error: {
            color: colors.error,
            fontFamily: fontFamily.semiBold,
            fontSize: 13,
            lineHeight: 18,
            marginTop: 6,
        },
    });