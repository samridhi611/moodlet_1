import { createPaletteColors, PaletteColors } from '@/theme/design';
import { PaletteId, PALETTES } from '@/theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Widgets render headless, outside the app's provider tree, so they can't
// call usePalette() (see src/context/PaletteContext.tsx). This is the
// equivalent read for native/headless code — same storage key, same default
// — so widget chrome follows whatever palette the user last picked in-app.
const PALETTE_STORAGE_KEY = '@moodlet_palette';
const DEFAULT_PALETTE: PaletteId = 'cloud';

export async function getWidgetColors(): Promise<PaletteColors> {
    let paletteId: PaletteId = DEFAULT_PALETTE;
    try {
        const saved = await AsyncStorage.getItem(PALETTE_STORAGE_KEY);
        if (saved && saved in PALETTES) {
            paletteId = saved as PaletteId;
        }
    } catch {
        // fall through with default
    }
    return createPaletteColors(PALETTES[paletteId]);
}
