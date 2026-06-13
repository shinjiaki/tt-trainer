import { Fragment } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

interface CourtPreviewProps {
  cols: number;
  count: number;
  /** Smaller cells for the card miniature. */
  small?: boolean;
}

/** Top-down preview grid of tables, reflecting cols + count (§5.3). */
export function CourtPreview({ cols, count, small }: CourtPreviewProps) {
  const { colors } = useTheme();
  const cellH = small ? 22 : 30;
  const gap = small ? 4 : 6;

  const rowCount = Math.ceil(count / Math.max(1, cols));

  return (
    <View style={{ gap }}>
      {Array.from({ length: rowCount }).map((_, row) => (
        <View key={row} style={{ flexDirection: 'row', gap }}>
          {Array.from({ length: cols }).map((__, col) => {
            const index = row * cols + col;
            const hasTable = index < count;
            return (
              <View key={col} style={{ flex: 1 }}>
                {hasTable ? (
                  <View
                    style={{
                      height: cellH,
                      borderRadius: small ? 5 : 7,
                      backgroundColor: colors.court,
                      borderWidth: 1.5,
                      borderColor: colors.courtLine,
                      flexDirection: 'row',
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: '34%',
                        borderRightWidth: 1.5,
                        borderStyle: 'dashed',
                        borderColor: colors.courtLine,
                      }}
                    />
                  </View>
                ) : (
                  <Fragment />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
