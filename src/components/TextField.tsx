import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

interface TextFieldProps {
  label?: string;
  labelExtra?: ReactNode;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}

/** Labelled text input used across the create/edit sheets. */
export function TextField({ label, labelExtra, value, onChangeText, placeholder }: TextFieldProps) {
  const { colors, fonts } = useTheme();
  return (
    <View>
      {label && (
        <Text
          style={{
            fontFamily: fonts.ui600,
            fontSize: 12.5,
            color: colors.textMuted,
            marginBottom: 9,
            letterSpacing: 0.2,
          }}
        >
          {label} {labelExtra}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={{
          fontFamily: fonts.ui400,
          fontSize: 15.5,
          color: colors.text,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1.5,
          borderColor: colors.border,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
        }}
      />
    </View>
  );
}
