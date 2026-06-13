import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Avatar, Button, LevelBadge, Screen } from '@/components';
import { Icon } from '@/icons';
import type { Player } from '@/models/types';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';

import { PlayerSheet } from './PlayerSheet';

export function PlayersScreen() {
  const { colors, fonts } = useTheme();
  const players = useStore((s) => s.players);
  const gyms = useStore((s) => s.gyms);
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const deletePlayer = useStore((s) => s.deletePlayer);

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Player | 'new' | null>(null);

  const filtered = useMemo(
    () => players.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [players, query],
  );

  return (
    <Screen>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <View>
          <Text style={{ fontFamily: fonts.display700, fontSize: 25, color: colors.text }}>
            Jogadores
          </Text>
          <Text style={{ fontFamily: fonts.ui400, fontSize: 13, color: colors.textMuted }}>
            {players.length} no grupo
          </Text>
        </View>
        <Button icon="plus" size="sm" onPress={() => setEditing('new')}>
          Novo
        </Button>
      </View>

      {/* search */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 13,
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 16,
        }}
      >
        <Icon name="search" size={18} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar jogador"
          placeholderTextColor={colors.textFaint}
          style={{ flex: 1, fontFamily: fonts.ui400, fontSize: 15, color: colors.text, padding: 0 }}
        />
      </View>

      {/* list */}
      <View style={{ gap: 9 }}>
        {filtered.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setEditing(p)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 13,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 15,
              paddingHorizontal: 13,
              paddingVertical: 11,
            }}
          >
            <Avatar player={p} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.ui600, fontSize: 15.5, color: colors.text }}>
                {p.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <LevelBadge level={p.level} small />
                <Text style={{ fontFamily: fonts.ui400, fontSize: 12, color: colors.textFaint }}>
                  {p.hand}
                </Text>
              </View>
              {p.gymIds.length > 0 && (
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}
                >
                  {p.gymIds.map((gid) => {
                    const g = gyms.find((x) => x.id === gid);
                    if (!g) return null;
                    return (
                      <View
                        key={gid}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                      >
                        <View
                          style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: g.color }}
                        />
                        <Text
                          style={{ fontFamily: fonts.ui600, fontSize: 11.5, color: colors.textMuted }}
                        >
                          {g.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
            <Icon name="edit" size={19} color={colors.textFaint} />
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 40,
              color: colors.textFaint,
              fontFamily: fonts.ui400,
              fontSize: 14,
            }}
          >
            Nenhum jogador encontrado.
          </Text>
        )}
      </View>

      <PlayerSheet
        editing={editing}
        gyms={gyms}
        onClose={() => setEditing(null)}
        onSave={(draft) => {
          if (editing === 'new') addPlayer(draft);
          else if (editing) updatePlayer(editing.id, draft);
          setEditing(null);
        }}
        onDelete={() => {
          if (editing && editing !== 'new') deletePlayer(editing.id);
          setEditing(null);
        }}
      />
    </Screen>
  );
}
