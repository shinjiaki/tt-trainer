import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet, Button, ColorSwatches, SegmentedControl, TextField } from '@/components';
import { Icon } from '@/icons';
import type { Gym, HandName, LevelName, Player } from '@/models/types';
import { useTheme } from '@/theme';
import { initials } from '@/utils/text';

import { HANDS, LEVELS, PLAYER_COLORS } from './constants';

export type PlayerDraft = Omit<Player, 'id'>;

interface PlayerSheetProps {
  /** The player being edited, 'new' for create, or null when closed. */
  editing: Player | 'new' | null;
  gyms: Gym[];
  onClose: () => void;
  onSave: (draft: PlayerDraft) => void;
  onDelete: () => void;
}

const blankDraft = (gyms: Gym[]): PlayerDraft => ({
  name: '',
  level: 'Iniciante',
  hand: 'Destro',
  color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
  gymIds: gyms[0] ? [gyms[0].id] : [],
});

export function PlayerSheet({ editing, gyms, onClose, onSave, onDelete }: PlayerSheetProps) {
  const { colors, fonts } = useTheme();
  const [draft, setDraft] = useState<PlayerDraft>(blankDraft(gyms));

  useEffect(() => {
    if (editing === 'new') setDraft(blankDraft(gyms));
    else if (editing) {
      const { name, level, hand, color, gymIds } = editing;
      setDraft({ name, level, hand, color, gymIds: [...gymIds] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const toggleGym = (id: string) =>
    setDraft((d) => ({
      ...d,
      gymIds: d.gymIds.includes(id) ? d.gymIds.filter((x) => x !== id) : [...d.gymIds, id],
    }));

  return (
    <BottomSheet
      open={editing !== null}
      onClose={onClose}
      title={editing === 'new' ? 'Novo jogador' : 'Editar jogador'}
    >
      <View style={{ gap: 18 }}>
        {/* avatar preview + name */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: draft.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontFamily: fonts.display700, fontSize: 20 }}>
              {draft.name.trim() ? initials(draft.name) : '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Nome"
              value={draft.name}
              onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
              placeholder="Nome do jogador"
            />
          </View>
        </View>

        <Field label="Nível">
          <SegmentedControl<LevelName>
            value={draft.level}
            options={LEVELS}
            onChange={(level) => setDraft((d) => ({ ...d, level }))}
          />
        </Field>

        <Field label="Mão dominante">
          <SegmentedControl<HandName>
            value={draft.hand}
            options={HANDS}
            onChange={(hand) => setDraft((d) => ({ ...d, hand }))}
          />
        </Field>

        <Field
          label="Ginásios"
          extra={<Text style={{ color: colors.textFaint, fontFamily: fonts.ui500 }}>(pode marcar vários)</Text>}
        >
          <View style={{ gap: 8 }}>
            {gyms.map((g) => {
              const on = draft.gymIds.includes(g.id);
              return (
                <Pressable
                  key={g.id}
                  onPress={() => toggleGym(g.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: on ? colors.primarySoft : colors.surfaceMuted,
                    borderWidth: 1.5,
                    borderColor: on ? colors.primary : colors.border,
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: g.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="court" size={15} color="#fff" />
                  </View>
                  <Text style={{ flex: 1, fontFamily: fonts.ui600, fontSize: 14.5, color: colors.text }}>
                    {g.name}
                  </Text>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      borderWidth: 1.5,
                      borderColor: on ? colors.primary : colors.borderStrong,
                      backgroundColor: on ? colors.primary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {on && <Icon name="check" size={14} color="#fff" strokeWidth={2.6} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Cor do avatar">
          <ColorSwatches
            colors={PLAYER_COLORS}
            value={draft.color}
            onChange={(color) => setDraft((d) => ({ ...d, color }))}
          />
        </Field>

        <Button full size="lg" icon="check" onPress={() => onSave(draft)}>
          Salvar jogador
        </Button>
        {editing !== 'new' && (
          <Pressable onPress={onDelete} style={{ alignSelf: 'center', padding: 6 }}>
            <Text style={{ color: colors.danger, fontFamily: fonts.ui600, fontSize: 14 }}>
              Remover jogador
            </Text>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}

function Field({
  label,
  extra,
  children,
}: {
  label: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View>
      <Text
        style={{
          fontFamily: fonts.ui600,
          fontSize: 12.5,
          color: colors.textMuted,
          marginBottom: 9,
          letterSpacing: 0.2,
        }}
      >
        {label} {extra}
      </Text>
      {children}
    </View>
  );
}
