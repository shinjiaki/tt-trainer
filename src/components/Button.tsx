import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/icons';
import { useTheme } from '@/theme';

type Variant = 'primary' | 'accent' | 'soft' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Button with variants + sizes + optional leading icon (§5.7). */
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  full = false,
  style,
}: ButtonProps) {
  const { colors, fonts, radius } = useTheme();

  const variants: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: 'transparent' },
    accent: { bg: colors.accent, fg: colors.onAccent, border: 'transparent' },
    soft: { bg: colors.primarySoft, fg: colors.primary, border: 'transparent' },
    ghost: { bg: 'transparent', fg: colors.text, border: colors.border },
  };
  const v = variants[variant];
  const padV = size === 'lg' ? 15 : size === 'sm' ? 8 : 12;
  const padH = size === 'lg' ? 22 : size === 'sm' ? 14 : 18;
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13.5 : 15;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: v.bg,
          borderWidth: 1.5,
          borderColor: v.border,
          borderRadius: radius.button,
          paddingVertical: padV,
          paddingHorizontal: padH,
          alignSelf: full ? 'stretch' : 'flex-start',
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <View>
          <Icon name={icon} size={fontSize + 3} color={v.fg} strokeWidth={2} />
        </View>
      )}
      <Text style={{ color: v.fg, fontFamily: fonts.ui600, fontSize, letterSpacing: 0.1 }}>
        {children}
      </Text>
    </Pressable>
  );
}
