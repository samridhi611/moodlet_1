import { createPaletteColors, PaletteColors } from '@/theme/design';
import { createSharedStyles, SharedStyles } from '@/theme/styles';
import { PaletteId, PALETTES, PaletteTokens } from '@/theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';


interface PaletteContextType {
  paletteId: PaletteId;
  tokens: PaletteTokens;
  colors: PaletteColors;
  styles: SharedStyles;
  setPalette: (id: PaletteId) => void;
  isLoading: boolean;
}

const DEFAULT_PALETTE: PaletteId = 'cloud';
const PALETTE_STORAGE_KEY = '@moodlet_palette';

const defaultColors = createPaletteColors(PALETTES[DEFAULT_PALETTE]);

const PaletteContext = createContext<PaletteContextType>({
  paletteId: DEFAULT_PALETTE,
  tokens: PALETTES[DEFAULT_PALETTE],
  colors: defaultColors,
  styles: createSharedStyles(defaultColors),
  setPalette: () => { },
  isLoading: true,
});

export const PaletteProvider = ({ children }: { children: React.ReactNode }) => {
  const [paletteId, setPaletteId] = useState<PaletteId>(DEFAULT_PALETTE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PALETTE_STORAGE_KEY)
      .then((savedId) => {
        if (savedId && savedId in PALETTES) {
          setPaletteId(savedId as PaletteId);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));  // ← unblock render only after load
  }, []);

  const setPalette = async (id: PaletteId) => {
    setPaletteId(id);  // optimistic update
    try {
      await AsyncStorage.setItem(PALETTE_STORAGE_KEY, id);
      // TODO: await supabase.from('profiles').update({ palette_id: id })
    } catch (e) {
      console.error('Failed to save palette', e);
      // optionally rollback: setPaletteId(paletteId)
    }
  };

  const tokens = PALETTES[paletteId];
  const colors = useMemo(() => createPaletteColors(tokens), [tokens]);
  const styles = useMemo(() => createSharedStyles(colors), [colors]);

  return (
    <PaletteContext.Provider
      value={{ paletteId, tokens, colors, styles, setPalette, isLoading }}
    >
      {children}
    </PaletteContext.Provider>
  );
};

export const usePalette = () => useContext(PaletteContext);