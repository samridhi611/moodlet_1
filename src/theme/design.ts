import { PaletteTokens } from './theme';

const fallbackColor = '#121212';

const normalizeHex = (hex: string) => {
  const value = hex.replace('#', '');

  if (value.length === 3) {
    return value
      .split('')
      .map((character) => character + character)
      .join('');
  }

  return value.padEnd(6, '0').slice(0, 6);
};

const hexToRgb = (hex: string) => {
  const value = normalizeHex(hex);
  const parsed = Number.parseInt(value, 16);

  if (Number.isNaN(parsed)) {
    return hexToRgb(fallbackColor);
  }

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');

const mix = (from: string, to: string, amount: number) => {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const ratio = Math.max(0, Math.min(1, amount));

  return `#${toHex(start.r + (end.r - start.r) * ratio)}${toHex(
    start.g + (end.g - start.g) * ratio,
  )}${toHex(start.b + (end.b - start.b) * ratio)}`;
};

export const createPaletteColors = (tokens: PaletteTokens) => ({
  background: tokens.bg,
  surface: mix(tokens.cardBg, '#FFFFFF', 0.58),
  surfaceWarm: tokens.cardBg,
  ink: tokens.text,
  muted: mix(tokens.text, tokens.bg, 0.42),
  softMuted: mix(tokens.text, tokens.bg, 0.58),
  primary: tokens.btnBg,
  primaryDark: mix(tokens.btnBg, tokens.text, 0.22),
  primarySoft: mix(tokens.btnBg, tokens.bg, 0.62),
  accent: tokens.accent,
  accentText: mix(tokens.accent, tokens.text, 0.35),
  blush: mix(tokens.cardBg, tokens.bg, 0.3),
  border: mix(tokens.ring, tokens.bg, 0.62),
  borderStrong: mix(tokens.ring, tokens.text, 0.28),
  inputIdle: mix(tokens.ring, tokens.bg, 0.48),
  inputFocus: mix(tokens.ring, tokens.text, 0.36),
  inputHover: mix(tokens.ring, tokens.text, 0.18),
  buttonText: tokens.btnText,
  error: '#B42318',
  errorSoft: mix('#B42318', tokens.bg, 0.9),
  white: '#FFFFFF',
});

export type PaletteColors = ReturnType<typeof createPaletteColors>;

export const fontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};
