import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button, IconButton, Screen } from '@/components';
import { Icon } from '@/icons';
import type { Gym } from '@/models/types';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';

import { GymSheet } from './GymSheet';

export function GymsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const gyms = useStore((s) => s.gyms);
  const courts = useStore((s) => s.courts);
  const players = useStore((s) => s.players);
  const addGym = useStore((s) => s.addGym);
  const updateGym = useStore((s) => s.updateGym);
  const deleteGym = useStore((s) => s.deleteGym);

  const [editing, setEditing] = useState<Gym | 'new' | null>(null);

  const countCourts = (gid: string) => courts.filter((c) => c.gymId === gid).length;
  const countPlayers = (gid: string) => players.filter((p) => p.gymIds.includes(gid)).length;

  return (
    <Screen>
      {/* header with back */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 14 }}>
        <IconButton icon="back" tone="muted" size={38} onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.display700, fontSize: 22, color: colors.text }}>
            Ginásios
          </Text>
          <Text style={{ fontFamily: fonts.ui400, fontSize: 12.5, color: colors.textMuted }}>
            Locais onde você treina
          </Text>
        </View>
        <Button icon="plus" size="sm" onPress={() => setEditing('new')}>
          Novo
        </Button>
      </View>

      <View style={{ gap: 12 }}>
        {gyms.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => setEditing(g)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                backgroundColor: g.color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="court" size={23} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.display700, fontSize: 17, color: colors.text }}>
                {g.name}
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon name="court" size={14} color={colors.textMuted} />
                  <Text style={{ fontFamily: fonts.ui500, fontSize: 12.5, color: colors.textMuted }}>
                    {countCourts(g.id)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon name="players" size={14} color={colors.textMuted} />
                  <Text style={{ fontFamily: fonts.ui500, fontSize: 12.5, color: colors.textMuted }}>
                    {countPlayers(g.id)}
                  </Text>
                </View>
                {!!g.city && (
                  <Text style={{ fontFamily: fonts.ui400, fontSize: 12.5, color: colors.textFaint }}>
                    · {g.city}
                  </Text>
                )}
              </View>
            </View>
            <Icon name="edit" size={19} color={colors.textFaint} />
          </Pressable>
        ))}
        {gyms.length === 0 && (
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 40,
              color: colors.textFaint,
              fontFamily: fonts.ui400,
              fontSize: 14,
            }}
          >
            Nenhum ginásio. Cadastre o primeiro.
          </Text>
        )}
      </View>

      <GymSheet
        editing={editing}
        onClose={() => setEditing(null)}
        onSave={(draft) => {
          if (editing === 'new') addGym(draft);
          else if (editing) updateGym(editing.id, draft);
          setEditing(null);
        }}
        onDelete={() => {
          if (editing && editing !== 'new') deleteGym(editing.id);
          setEditing(null);
        }}
      />
    </Screen>
  );
}
