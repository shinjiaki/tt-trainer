import { type ComponentRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components';
import { Icon } from '@/icons';
import type { Player, TableFormat, TableModel, TableSide } from '@/models/types';
import { useTheme } from '@/theme';
import { firstName } from '@/utils/text';

type ViewRef = ComponentRef<typeof View>;

export interface TableTopProps {
  table: TableModel;
  format: TableFormat;
  coach: Player[];
  players: Player[];
  /** Which side is currently hovered during a drag, if any. */
  dragOverSide: TableSide | null;
  /** Whole-table flag: a drag is hovering this table. */
  listMode?: boolean;
  onPressSide: (table: TableModel, side: TableSide) => void;
  registerZone: (key: string, node: ViewRef | null) => void;
}

/** One table, top-down: coach side | net | players side (§5.5 + new feature). */
export function TableTop({
  table,
  format,
  coach,
  players,
  dragOverSide,
  listMode,
  onPressSide,
  registerZone,
}: TableTopProps) {
  const { colors, fonts } = useTheme();
  const minHeight = listMode ? 96 : 116;
  const hovering = dragOverSide !== null;

  return (
    <View
      style={{
        backgroundColor: colors.court,
        borderWidth: 2,
        borderColor: hovering ? colors.accent : colors.courtLine,
        borderRadius: 14,
        overflow: 'hidden',
        minHeight,
      }}
    >
      {/* label */}
      <View
        style={{
          position: 'absolute',
          top: 7,
          left: 9,
          zIndex: 2,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 7,
          paddingVertical: 2,
          paddingHorizontal: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <Text style={{ fontFamily: fonts.display600, fontSize: 11.5, letterSpacing: 0.4, color: colors.textMuted }}>
          {table.label}
        </Text>
        {format === 'doubles' && (
          <Text style={{ fontFamily: fonts.ui700, fontSize: 9, color: colors.accent }}>DUPLAS</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', minHeight }}>
        {/* coach side */}
        <Pressable
          ref={(node) => registerZone(`${table.id}:coach`, node)}
          onPress={() => onPressSide(table, 'coach')}
          style={{
            width: '34%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 4,
            backgroundColor: dragOverSide === 'coach' ? colors.accentSoft : 'transparent',
          }}
        >
          {coach.length === 0 ? (
            <CoachPlaceholder hint={dragOverSide === 'coach'} />
          ) : (
            <SeatList players={coach} coachRole />
          )}
        </Pressable>

        {/* net */}
        <View
          style={{ borderLeftWidth: 2, borderStyle: 'dashed', borderColor: colors.courtLine, marginVertical: 12 }}
        />

        {/* players side */}
        <Pressable
          ref={(node) => registerZone(`${table.id}:players`, node)}
          onPress={() => onPressSide(table, 'players')}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: 10,
            backgroundColor: dragOverSide === 'players' ? colors.accentSoft : 'transparent',
          }}
        >
          {players.length === 0 ? (
            <EmptyPlayers hint={dragOverSide === 'players'} />
          ) : (
            <SeatList players={players} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function SeatList({ players, coachRole }: { players: Player[]; coachRole?: boolean }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {players.map((p) => (
        <View key={p.id} style={{ alignItems: 'center', gap: 2, width: 42 }}>
          <View>
            <Avatar player={p} size={32} />
            {coachRole && (
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="whistle" size={10} color={colors.text} />
              </View>
            )}
          </View>
          <Text
            numberOfLines={1}
            style={{ fontFamily: fonts.ui600, fontSize: 9.5, color: colors.text, maxWidth: 42, textAlign: 'center' }}
          >
            {firstName(p.name)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function CoachPlaceholder({ hint }: { hint: boolean }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 5 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="whistle" size={19} color={colors.text} />
      </View>
      <Text style={{ fontFamily: fonts.ui600, fontSize: 10.5, color: colors.textMuted }}>
        {hint ? 'Soltar aqui' : 'Treinador'}
      </Text>
    </View>
  );
}

function EmptyPlayers({ hint }: { hint: boolean }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="plus" size={16} color={colors.textFaint} />
      </View>
      <Text style={{ fontFamily: fonts.ui500, fontSize: 10, color: colors.textFaint, textAlign: 'center' }}>
        {hint ? 'Soltar aqui' : 'Adicionar'}
      </Text>
    </View>
  );
}
