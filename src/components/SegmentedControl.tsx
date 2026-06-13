import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme';

interface Option<T> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: (Option<T> | T)[];
  onChange: (value: T) => void;
}

/** Segmented control for level / hand / columns / format (§5.7). */
export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors, fonts } = useTheme();
  const opts = options.map((o) =>
    typeof o === 'object' ? o : ({ label: String(o), value: o } as Option<T>),
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceMuted,
        borderRadius: 11,
        padding: 3,
        gap: 3,
      }}
    >
      {opts.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              borderRadius: 8,
              paddingVertical: 9,
              paddingHorizontal: 4,
              alignItems: 'center',
              backgroundColor: active ? colors.surface : 'transparent',
              shadowColor: '#000',
              shadowOpacity: active ? 0.1 : 0,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: active ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.ui600,
                fontSize: 13,
                color: active ? colors.primary : colors.textMuted,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
