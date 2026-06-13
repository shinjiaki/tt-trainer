import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet, Button, SegmentedControl, Stepper, TextField } from '@/components';
import type { Court } from '@/models/types';
import { useTheme } from '@/theme';

import { CourtPreview } from './CourtPreview';

export interface CourtDraft {
  name: string;
  cols: number;
  tableCount: number;
}

interface CourtSheetProps {
  editing: Court | 'new' | null;
  onClose: () => void;
  onSave: (draft: CourtDraft) => void;
  onDelete: () => void;
}

const blankDraft = (): CourtDraft => ({ name: '', cols: 2, tableCount: 4 });

export function CourtSheet({ editing, onClose, onSave, onDelete }: CourtSheetProps) {
  const { colors, fonts } = useTheme();
  const [draft, setDraft] = useState<CourtDraft>(blankDraft());

  useEffect(() => {
    if (editing === 'new') setDraft(blankDraft());
    else if (editing)
      setDraft({ name: editing.name, cols: editing.cols, tableCount: editing.tables.length });
  }, [editing]);

  return (
    <BottomSheet
      open={editing !== null}
      onClose={onClose}
      title={editing === 'new' ? 'Nova quadra' : 'Editar quadra'}
    >
      <View style={{ gap: 18 }}>
        <TextField
          label="Nome da quadra"
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
          placeholder="Ex: Quadra Principal"
        />

        <View>
          <Text style={labelStyle(fonts, colors)}>Colunas (disposição)</Text>
          <SegmentedControl<number>
            value={draft.cols}
            options={[1, 2, 3]}
            onChange={(cols) => setDraft((d) => ({ ...d, cols }))}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[labelStyle(fonts, colors), { marginBottom: 0 }]}>Número de mesas</Text>
          <Stepper
            value={draft.tableCount}
            onChange={(tableCount) => setDraft((d) => ({ ...d, tableCount }))}
            min={1}
            max={12}
          />
        </View>

        <View>
          <Text style={labelStyle(fonts, colors)}>Pré-visualização</Text>
          <View style={{ backgroundColor: colors.surfaceInset, borderRadius: 14, padding: 14 }}>
            <CourtPreview cols={draft.cols} count={draft.tableCount} />
          </View>
        </View>

        <Button full size="lg" icon="check" onPress={() => onSave(draft)}>
          Salvar quadra
        </Button>
        {editing !== 'new' && (
          <Pressable onPress={onDelete} style={{ alignSelf: 'center', padding: 6 }}>
            <Text style={{ color: colors.danger, fontFamily: fonts.ui600, fontSize: 14 }}>
              Excluir quadra
            </Text>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}

const labelStyle = (fonts: { ui600: string }, colors: { textMuted: string }) => ({
  fontFamily: fonts.ui600,
  fontSize: 12.5,
  color: colors.textMuted,
  marginBottom: 9,
  letterSpacing: 0.2,
});
