import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

interface ColorSwatchesProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  /** 'circle' for avatars, 'square' for gym colors. */
  shape?: 'circle' | 'square';
}

/** Row of selectable color swatches (§5.2 / §5.4). */
export function ColorSwatches({ colors, value, onChange, shape = 'circle' }: ColorSwatchesProps) {
  const { colors: theme } = useTheme();
  const size = 34;
  const radius = shape === 'circle' ? size / 2 : 10;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {colors.map((c) => {
        const selected = c.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            style={{
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: c,
              borderWidth: 3,
              borderColor: selected ? theme.text : 'transparent',
            }}
          >
            {selected && (
              <View
                style={{
                  position: 'absolute',
                  top: -1,
                  left: -1,
                  right: -1,
                  bottom: -1,
                  borderRadius: radius,
                  borderWidth: 2,
                  borderColor: theme.surface,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
