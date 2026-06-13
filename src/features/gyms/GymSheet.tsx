import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet, Button, ColorSwatches, TextField } from '@/components';
import type { Gym } from '@/models/types';
import { useTheme } from '@/theme';

export const GYM_COLORS = [
  '#1d5fd6',
  '#ff6a2b',
  '#1f9d5b',
  '#8b5cf6',
  '#e0a400',
  '#e64980',
  '#0ea5b7',
];

export type GymDraft = Omit<Gym, 'id'>;

interface GymSheetProps {
  editing: Gym | 'new' | null;
  onClose: () => void;
  onSave: (draft: GymDraft) => void;
  onDelete: () => void;
}

const blankDraft = (): GymDraft => ({
  name: '',
  city: '',
  color: GYM_COLORS[Math.floor(Math.random() * GYM_COLORS.length)],
});

export function GymSheet({ editing, onClose, onSave, onDelete }: GymSheetProps) {
  const { colors, fonts } = useTheme();
  const [draft, setDraft] = useState<GymDraft>(blankDraft());

  useEffect(() => {
    if (editing === 'new') setDraft(blankDraft());
    else if (editing) setDraft({ name: editing.name, city: editing.city ?? '', color: editing.color });
  }, [editing]);

  return (
    <BottomSheet
      open={editing !== null}
      onClose={onClose}
      title={editing === 'new' ? 'Novo ginásio' : 'Editar ginásio'}
    >
      <View style={{ gap: 18 }}>
        <TextField
          label="Nome do ginásio"
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
          placeholder="Ex: Arena Pinheiros"
        />
        <TextField
          label="Cidade / referência"
          labelExtra={<Text style={{ color: colors.textFaint, fontFamily: fonts.ui500 }}>(opcional)</Text>}
          value={draft.city ?? ''}
          onChangeText={(city) => setDraft((d) => ({ ...d, city }))}
          placeholder="Ex: São Paulo · SP"
        />
        <View>
          <Text
            style={{
              fontFamily: fonts.ui600,
              fontSize: 12.5,
              color: colors.textMuted,
              marginBottom: 9,
            }}
          >
            Cor
          </Text>
          <ColorSwatches
            colors={GYM_COLORS}
            value={draft.color}
            onChange={(color) => setDraft((d) => ({ ...d, color }))}
            shape="square"
          />
        </View>

        <Button full size="lg" icon="check" onPress={() => onSave(draft)}>
          Salvar ginásio
        </Button>
        {editing !== 'new' && (
          <Pressable onPress={onDelete} style={{ alignSelf: 'center', padding: 6 }}>
            <Text style={{ color: colors.danger, fontFamily: fonts.ui600, fontSize: 14 }}>
              Excluir ginásio e suas quadras
            </Text>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}
