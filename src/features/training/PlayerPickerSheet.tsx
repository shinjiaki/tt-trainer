import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Avatar, BottomSheet, LevelBadge } from '@/components';
import { Icon, type IconName } from '@/icons';
import type { Player } from '@/models/types';
import { useTheme } from '@/theme';

interface PlayerPickerSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Candidates to pick from. */
  players: Player[];
  emptyText: string;
  /** Pick a player (sheet stays open so several can be picked in a row). */
  onPick: (id: string) => void;
  /** Show a search field. */
  search?: boolean;
  /** Optional "create new" action at the top. */
  onCreateNew?: () => void;
  /** Icon + tint of the per-row action button. */
  actionIcon?: IconName;
  actionTone?: 'primary' | 'danger';
}

/** Generic sheet to pick a player from a list (add-to-roster, mark-absent…). */
export function PlayerPickerSheet({
  open,
  onClose,
  title,
  players,
  emptyText,
  onPick,
  search,
  onCreateNew,
  actionIcon = 'plus',
  actionTone = 'primary',
}: PlayerPickerSheetProps) {
  const { colors, fonts } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const tone = actionTone === 'danger' ? colors.danger : colors.primary;
  const toneSoft = actionTone === 'danger' ? colors.surfaceMuted : colors.primarySoft;

  const filtered = search
    ? players.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : players;

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <View style={{ gap: 12 }}>
        {onCreateNew && (
          <Pressable
            onPress={onCreateNew}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: colors.primarySoft,
              borderRadius: 13,
              padding: 11,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="userPlus" size={18} color="#fff" />
            </View>
            <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.primary }}>
              Novo jogador
            </Text>
          </Pressable>
        )}

        {search && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.surfaceMuted,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 13,
              paddingVertical: 9,
            }}
          >
            <Icon name="search" size={17} color={colors.textFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por nome"
              placeholderTextColor={colors.textFaint}
              style={{ flex: 1, fontFamily: fonts.ui400, fontSize: 15, color: colors.text, padding: 0 }}
            />
          </View>
        )}

        {filtered.length === 0 ? (
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 20,
              fontFamily: fonts.ui400,
              fontSize: 14,
              color: colors.textFaint,
            }}
          >
            {emptyText}
          </Text>
        ) : (
          <View style={{ gap: 8 }}>
            {filtered.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => onPick(p.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: 13,
                  padding: 8,
                }}
              >
                <Avatar player={p} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>
                    {p.name}
                  </Text>
                  <LevelBadge level={p.level} small />
                </View>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: toneSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={actionIcon} size={18} color={tone} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}
