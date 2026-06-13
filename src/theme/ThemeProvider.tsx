/**
 * ThemeProvider (§5.7) — resolves the active palette from settings (theme +
 * accent override) and exposes it through context. Components read it via
 * `useTheme()`.
 */
import { createContext, type ReactNode, useContext, useMemo } from 'react';

import { useStore } from '@/store/useStore';

import { FontFamily } from './fonts';
import { Layout, Radius, type ThemeColors, Themes } from './themes';

export interface AppTheme {
  name: string;
  dark: boolean;
  colors: ThemeColors;
  radius: typeof Radius;
  fonts: typeof FontFamily;
  layout: typeof Layout;
}

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeName = useStore((s) => s.settings.theme);
  const accent = useStore((s) => s.settings.accent);

  const value = useMemo<AppTheme>(() => {
    const palette = Themes[themeName] ?? Themes.azul;
    const colors: ThemeColors = {
      ...palette.colors,
      accent: accent[0],
      accentSoft: accent[1],
      onAccent: '#ffffff',
    };
    return {
      name: palette.name,
      dark: palette.dark,
      colors,
      radius: Radius,
      fonts: FontFamily,
      layout: Layout,
    };
  }, [themeName, accent]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
