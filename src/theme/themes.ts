/**
 * Design tokens — the 3 selectable themes (§2.2) plus shared radii (§2.3) and
 * the configurable accent overrides (§2.2). Transcribed from
 * claude_design/theme.js.
 */
import type { AccentPair, ThemeName } from '@/models/types';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceMuted: string;
  surfaceInset: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryDim: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  good: string;
  goodSoft: string;
  warn: string;
  court: string;
  courtLine: string;
  /** Color used for destructive actions (§2.3). */
  danger: string;
}

export interface ThemePalette {
  name: string;
  dark: boolean;
  colors: ThemeColors;
}

const DANGER = '#e5484d';

export const Themes: Record<ThemeName, ThemePalette> = {
  azul: {
    name: 'Azul & Laranja',
    dark: false,
    colors: {
      bg: '#eaeef4',
      surface: '#ffffff',
      surfaceMuted: '#f3f6fb',
      surfaceInset: '#eef2f8',
      border: '#e1e7f0',
      borderStrong: '#cfd8e6',
      text: '#141925',
      textMuted: '#5d6678',
      textFaint: '#97a0b1',
      primary: '#1d5fd6',
      primaryDim: '#1a52ba',
      primarySoft: '#e6eefb',
      onPrimary: '#ffffff',
      accent: '#ff6a2b',
      accentSoft: '#ffe9dd',
      onAccent: '#ffffff',
      good: '#1f9d5b',
      goodSoft: '#e3f5ea',
      warn: '#e0a400',
      court: '#dde6f1',
      courtLine: '#c3cfde',
      danger: DANGER,
    },
  },
  escuro: {
    name: 'Esportivo Escuro',
    dark: true,
    colors: {
      bg: '#0c1220',
      surface: '#151d2e',
      surfaceMuted: '#1b2438',
      surfaceInset: '#101827',
      border: '#27324a',
      borderStrong: '#33415e',
      text: '#eef2f9',
      textMuted: '#9aa6bc',
      textFaint: '#5e6a82',
      primary: '#3f86ff',
      primaryDim: '#357bf2',
      primarySoft: '#1a2a47',
      onPrimary: '#ffffff',
      accent: '#ff7a3c',
      accentSoft: '#3a2317',
      onAccent: '#ffffff',
      good: '#34c77b',
      goodSoft: '#16301f',
      warn: '#f0b51e',
      court: '#1a2336',
      courtLine: '#2c3a56',
      danger: DANGER,
    },
  },
  verde: {
    name: 'Mesa Verde',
    dark: false,
    colors: {
      bg: '#e9efe9',
      surface: '#ffffff',
      surfaceMuted: '#f2f6f1',
      surfaceInset: '#edf2ec',
      border: '#dde6dc',
      borderStrong: '#cad6c8',
      text: '#15201a',
      textMuted: '#566058',
      textFaint: '#93a094',
      primary: '#1f7a52',
      primaryDim: '#1a6a47',
      primarySoft: '#e1f1e8',
      onPrimary: '#ffffff',
      accent: '#ff6a2b',
      accentSoft: '#ffe9dd',
      onAccent: '#ffffff',
      good: '#1f9d5b',
      goodSoft: '#e3f5ea',
      warn: '#e0a400',
      court: '#dbe8df',
      courtLine: '#c2d4c8',
      danger: DANGER,
    },
  },
};

/** Radii (§2.3). */
export const Radius = {
  card: 16,
  sm: 11,
  lg: 22,
  pill: 999,
  button: 13,
  sheetTop: 26,
} as const;

/** Base screen padding & common gaps (§2.3). */
export const Layout = {
  screenPaddingH: 16,
} as const;

/** Accent override options (§2.2). First value = accent, second = accentSoft. */
export const AccentOptions: AccentPair[] = [
  ['#ff6a2b', '#ffe9dd'], // laranja
  ['#e5484d', '#fbe4e4'], // vermelho
  ['#e64980', '#fce4ee'], // magenta
  ['#0ea5b7', '#dcf3f6'], // ciano
];
