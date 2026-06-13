import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar, BottomSheet, IconButton, LevelBadge, SegmentedControl, TextField } from '@/components';
import { Icon } from '@/icons';
import type { Player, TableFormat, TableModel, TableSide } from '@/models/types';
import { coachCapacity, playerCapacity } from '@/store/useStore';
import { useTheme } from '@/theme';

interface ManageTableSheetProps {
  table: TableModel | null;
  format: TableFormat;
  coach: Player[];
  players: Player[];
  bench: Player[];
  onClose: () => void;
  onSetFormat: (format: TableFormat) => void;
  onRemove: (playerId: string) => void;
  onAdd: (playerId: string, side: TableSide) => void;
  onRename: (label: string) => void;
}

export function ManageTableSheet({
  table,
  format,
  coach,
  players,
  bench,
  onClose,
  onSetFormat,
  onRemove,
  onAdd,
  onRename,
}: ManageTableSheetProps) {
  const { colors, fonts } = useTheme();
  const doubles = format === 'doubles';

  // Local draft for the table name; committed on blur so clearing the field mid-typing
  // doesn't immediately fall back to the old label.
  const [nameDraft, setNameDraft] = useState('');
  useEffect(() => {
    if (table) setNameDraft(table.label);
  }, [table?.id]);

  const handleClose = () => {
    if (table && nameDraft.trim() && nameDraft.trim() !== table.label) onRename(nameDraft);
    onClose();
  };

  const coachFull = coach.length >= coachCapacity(format);
  const playersFull = players.length >= playerCapacity(format);

  return (
    <BottomSheet open={table !== null} onClose={handleClose} title={table?.label ?? ''}>
      <View style={{ gap: 16 }}>
        {/* name */}
        <TextField
          label="Nome da mesa"
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder="Mesa"
        />

        {/* format */}
        <View>
          <SubLabel>Formato</SubLabel>
          <SegmentedControl<TableFormat>
            value={format}
            options={[
              { label: 'Treino (1 × N)', value: 'training' },
              { label: 'Duplas (2 × 2)', value: 'doubles' },
            ]}
            onChange={onSetFormat}
          />
        </View>

        {/* coach side */}
        <View>
          <SubLabel>
            {doubles ? 'Lado 1' : 'Lado treinador'} · {coach.length}
            {doubles ? '/2' : '/1'}
          </SubLabel>
          {coach.length === 0 ? (
            <Empty>{doubles ? 'Vazio. Adicione do banco abaixo.' : 'Sem treinador definido. Adicione do banco abaixo.'}</Empty>
          ) : (
            <View style={{ gap: 8 }}>
              {coach.map((p) => (
                <SeatedRow key={p.id} player={p} onRemove={() => onRemove(p.id)} />
              ))}
            </View>
          )}
        </View>

        {/* players side */}
        <View>
          <SubLabel>
            {doubles ? 'Lado 2' : 'Na mesa'} · {players.length}
            {doubles ? '/2' : ''}
          </SubLabel>
          {players.length === 0 ? (
            <Empty>Nenhum jogador ainda. Adicione abaixo.</Empty>
          ) : (
            <View style={{ gap: 8 }}>
              {players.map((p) => (
                <SeatedRow key={p.id} player={p} onRemove={() => onRemove(p.id)} />
              ))}
            </View>
          )}
        </View>

        {/* bench */}
        <View>
          <SubLabel>Banco · {bench.length}</SubLabel>
          {bench.length === 0 ? (
            <Empty>Banco vazio.</Empty>
          ) : (
            <View style={{ gap: 8 }}>
              {bench.map((p) => (
                <View
                  key={p.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 13,
                    padding: 8,
                  }}
                >
                  <Avatar player={p} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>{p.name}</Text>
                    <LevelBadge level={p.level} small />
                  </View>
                  <AddButton
                    icon={doubles ? 'plus' : 'whistle'}
                    label={doubles ? 'Lado 1' : 'Treinador'}
                    disabled={coachFull}
                    onPress={() => onAdd(p.id, 'coach')}
                  />
                  <AddButton
                    icon="plus"
                    label={doubles ? 'Lado 2' : 'Mesa'}
                    disabled={playersFull}
                    onPress={() => onAdd(p.id, 'players')}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <Text
      style={{
        fontFamily: fonts.ui600,
        fontSize: 12.5,
        color: colors.textFaint,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <Text style={{ fontFamily: fonts.ui400, fontSize: 14, color: colors.textFaint, paddingBottom: 4 }}>
      {children}
    </Text>
  );
}

function SeatedRow({ player, onRemove }: { player: Player; onRemove: () => void }) {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.surfaceMuted,
        borderRadius: 13,
        padding: 8,
      }}
    >
      <Avatar player={player} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>{player.name}</Text>
        <LevelBadge level={player.level} small />
      </View>
      <IconButton icon="close" tone="danger" size={34} onPress={onRemove} />
    </View>
  );
}

function AddButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'whistle' | 'plus';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        alignItems: 'center',
        gap: 2,
        opacity: disabled ? 0.35 : 1,
        backgroundColor: colors.primarySoft,
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 8,
        minWidth: 56,
      }}
    >
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={{ fontFamily: fonts.ui600, fontSize: 9.5, color: colors.primary }}>{label}</Text>
    </Pressable>
  );
}
