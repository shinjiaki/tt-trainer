import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Optional unit suffix shown after the value (e.g. "min"). */
  unit?: string;
  /** Smaller variant used inside settings rows. */
  compact?: boolean;
}

/** Numeric stepper with ± buttons (§5.7). */
export function Stepper({ value, onChange, min = 1, max = 99, unit, compact }: StepperProps) {
  const { colors, fonts } = useTheme();
  const dim = compact ? 30 : 38;

  const btn = (label: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: dim,
        height: dim,
        borderRadius: compact ? 9 : 11,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceMuted,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ color: colors.text, fontSize: compact ? 18 : 20, fontFamily: fonts.ui600, lineHeight: compact ? 20 : 22 }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 10 : 14 }}>
      {btn('–', () => onChange(Math.max(min, value - 1)))}
      <Text
        style={{
          fontFamily: compact ? fonts.mono700 : fonts.display700,
          fontSize: compact ? 15 : 22,
          color: colors.text,
          minWidth: compact ? 38 : 28,
          textAlign: 'center',
        }}
      >
        {value}
        {unit ? ` ${unit}` : ''}
      </Text>
      {btn('+', () => onChange(Math.min(max, value + 1)))}
    </View>
  );
}
