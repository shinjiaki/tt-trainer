/**
 * Font family names (§2.1 Tipografia). These string keys match the export
 * names from the @expo-google-fonts packages, which are also the family names
 * registered by `useFonts` in the root layout.
 *
 * - display → Space Grotesk (titles, big numbers)
 * - ui      → Hanken Grotesk (body / UI)
 * - mono    → JetBrains Mono (timer / monospace values)
 */
export const FontFamily = {
  display500: 'SpaceGrotesk_500Medium',
  display600: 'SpaceGrotesk_600SemiBold',
  display700: 'SpaceGrotesk_700Bold',
  ui400: 'HankenGrotesk_400Regular',
  ui500: 'HankenGrotesk_500Medium',
  ui600: 'HankenGrotesk_600SemiBold',
  ui700: 'HankenGrotesk_700Bold',
  mono500: 'JetBrainsMono_500Medium',
  mono700: 'JetBrainsMono_700Bold',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;
