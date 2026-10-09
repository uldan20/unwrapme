'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_THEME, paletteOf, type Palette, type Theme } from '@/templates/rak-buku/theme';

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

export const ThemeProvider = ThemeContext.Provider;

/** The buyer's theme, and the palette it names. */
export function useTheme(): Theme & { pal: Palette } {
  const theme = useContext(ThemeContext);
  return { ...theme, pal: paletteOf(theme) };
}
