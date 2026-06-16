import { Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components';
import { Icon } from '@/icons';
import type { Player } from '@/models/types';
import { useTheme } from '@/theme';
import { firstName } from '@/utils/text';

interface NoShowBarProps {
  players: Player[];
  /** Open the picker to mark a present player as absent. */
  onAdd: () => void;
  /** Tap a chip to undo the absence (back to bench). */
  onRemove: (playerId: string) => void;
}

/** Compact strip for players marked "Não veio" (absent). Excluded from tables. */
export function NoShowBar({ players, onAdd, onRemove }: NoShowBarProps) {
  const { colors, fonts } = useTheme();

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surfaceInset,
        paddingTop: 8,
        paddingBottom: 6,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: players.length > 0 ? 8 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="userMinus" size={16} color={colors.textMuted} />
          <Text style={{ fontFamily: fonts.display600, fontSize: 13, color: colors.textMuted }}>
            Não veio
          </Text>
          {players.length > 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 7,
                paddingVertical: 1,
                paddingHorizontal: 7,
              }}
            >
              <Text style={{ fontFamily: fonts.mono700, fontSize: 12, color: colors.textMuted }}>
                {players.length}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={onAdd}
          hitSlop={8}
          accessibilityLabel="Marcar falta"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 9,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Icon name="plus" size={15} color={colors.textMuted} />
          <Text style={{ fontFamily: fonts.ui600, fontSize: 12, color: colors.textMuted }}>
            Marcar
          </Text>
        </Pressable>
      </View>

      {players.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 2 }}
        >
          {players.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onRemove(p.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                backgroundColor: colors.surfaceMuted,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 999,
                paddingVertical: 5,
                paddingLeft: 5,
                paddingRight: 10,
                opacity: 0.85,
              }}
            >
              <Avatar player={p} size={26} />
              <Text style={{ fontFamily: fonts.ui600, fontSize: 12.5, color: colors.textMuted }}>
                {firstName(p.name)}
              </Text>
              <Icon name="close" size={14} color={colors.textFaint} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
