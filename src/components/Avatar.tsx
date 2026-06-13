import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { Player } from '@/models/types';
import { useTheme } from '@/theme';
import { initials } from '@/utils/text';

interface AvatarProps {
  player?: Pick<Player, 'name' | 'color'> | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Circle avatar with player color + initials (§2.5). Empty = dashed ring. */
export function Avatar({ player, size = 40, style }: AvatarProps) {
  const { colors, fonts } = useTheme();

  if (!player) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.borderStrong,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: player.color },
        style,
      ]}
    >
      <Text
        style={{
          color: '#fff',
          fontFamily: fonts.display600,
          fontSize: size * 0.36,
          letterSpacing: 0.2,
        }}
      >
        {initials(player.name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
