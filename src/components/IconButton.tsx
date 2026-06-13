import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/icons';
import { useTheme } from '@/theme';

type Tone = 'ghost' | 'muted' | 'primary' | 'danger';

interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  tone?: Tone;
  accessibilityLabel?: string;
}

/** Square icon button with tone variants (§5.7). */
export function IconButton({
  icon,
  onPress,
  size = 40,
  tone = 'ghost',
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();

  const tones: Record<Tone, { bg: string; fg: string }> = {
    ghost: { bg: 'transparent', fg: colors.text },
    muted: { bg: colors.surfaceMuted, fg: colors.text },
    primary: { bg: colors.primary, fg: colors.onPrimary },
    danger: { bg: colors.surfaceMuted, fg: colors.danger },
  };
  const t = tones[tone];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: t.bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={size * 0.5} color={t.fg} />
    </Pressable>
  );
}
