import { Text, View } from 'react-native';

import type { LevelName } from '@/models/types';
import { useTheme } from '@/theme';

/** Level pill with per-level tones (§5.4). */
export function LevelBadge({ level, small = false }: { level: LevelName; small?: boolean }) {
  const { colors, fonts } = useTheme();

  const tone: Record<LevelName, [string, string]> = {
    Iniciante: [colors.goodSoft, colors.good],
    Intermediário: [colors.accentSoft, colors.accent],
    Avançado: [colors.primarySoft, colors.primary],
  };
  const [bg, fg] = tone[level];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        borderRadius: 999,
        paddingVertical: small ? 2 : 3,
        paddingHorizontal: small ? 8 : 10,
      }}
    >
      <Text style={{ color: fg, fontFamily: fonts.ui600, fontSize: small ? 11 : 12, letterSpacing: 0.1 }}>
        {level}
      </Text>
    </View>
  );
}
