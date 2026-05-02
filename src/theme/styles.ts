import { StyleSheet } from 'react-native';
import { fontFamily, PaletteColors } from './design';

// ─── Buttons ────────────────────────────────────────────────────────────────

const createButtonStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        primary: {
            alignItems: 'center',
            backgroundColor: colors.primary,
            borderRadius: 999,
            justifyContent: 'center',
            minHeight: 56,
        },
        primaryHovered: { backgroundColor: colors.primaryDark },
        primaryPressed: { backgroundColor: colors.primaryDark, transform: [{ scale: 0.99 }] },
        primaryDisabled: { opacity: 0.42 },
        primaryText: {
            color: colors.buttonText,
            fontFamily: fontFamily.extraBold,
            fontSize: 16,
        },

        secondary: {
            alignItems: 'center',
            backgroundColor: 'transparent',
            borderColor: colors.inputIdle,
            borderRadius: 999,
            borderWidth: 1.5,
            justifyContent: 'center',
            minHeight: 54,
        },
        secondaryHovered: { backgroundColor: colors.primarySoft, borderColor: colors.inputHover },
        secondaryPressed: { borderColor: colors.inputFocus, transform: [{ scale: 0.99 }] },
        secondaryText: {
            color: colors.ink,
            fontFamily: fontFamily.extraBold,
            fontSize: 16,
        },
    });

// ─── Inputs ─────────────────────────────────────────────────────────────────

const createInputStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        frame: {
            backgroundColor: 'transparent',
            borderColor: colors.inputIdle,
            borderRadius: 8,
            borderWidth: 1.5,
            justifyContent: 'center',
            minHeight: 58,
        },
        hovered: { borderColor: colors.inputHover },
        focused: { borderColor: colors.inputFocus, borderWidth: 2 },
        errored: { borderColor: colors.error },
        text: {
            color: colors.ink,
            fontFamily: fontFamily.bold,
            fontSize: 18,
            paddingHorizontal: 15,
            paddingVertical: 0,
        },
        label: {
            color: colors.softMuted,
            fontFamily: fontFamily.bold,
            fontSize: 13,
        },
        labelFocused: { color: colors.ink },
        errorText: {
            color: colors.error,
            fontFamily: fontFamily.semiBold,
            fontSize: 13,
            lineHeight: 18,
        },
    });

// ─── Typography ──────────────────────────────────────────────────────────────

const createTypographyStyles = (colors: PaletteColors) =>
    StyleSheet.create({
        kicker: {
            color: colors.accentText,
            fontFamily: fontFamily.extraBold,
            fontSize: 12,
            textTransform: 'uppercase',
        },
        screenTitle: {
            color: colors.ink,
            fontFamily: fontFamily.extraBold,
            fontSize: 34,
            lineHeight: 40,
        },
        subtitle: {
            color: colors.muted,
            fontFamily: fontFamily.medium,
            fontSize: 15,
            lineHeight: 23,
        },
        bodyMd: {
            color: colors.ink,
            fontFamily: fontFamily.medium,
            fontSize: 15,
            lineHeight: 23,
        },
        caption: {
            color: colors.softMuted,
            fontFamily: fontFamily.semiBold,
            fontSize: 13,
        },
    });

// ─── Layout ──────────────────────────────────────────────────────────────────
// Static — no color dependency, defined once at module level

export const layout = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    center: { alignItems: 'center', justifyContent: 'center' },
    flex1: { flex: 1 },
    safeArea: { flex: 1 },
    screenPad: { paddingHorizontal: 24, paddingVertical: 22 },
});

// ─── Root export ─────────────────────────────────────────────────────────────

export type SharedStyles = ReturnType<typeof createSharedStyles>;

export const createSharedStyles = (colors: PaletteColors) => ({
    btn: createButtonStyles(colors),
    input: createInputStyles(colors),
    type: createTypographyStyles(colors),
    layout, // static, included for convenience
});