import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

/** Uppercase section label (§5.7). */
export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.display600,
          fontSize: 12.5,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: colors.textFaint,
        }}
      >
        {children}
      </Text>
      {right}
    </View>
  );
}
