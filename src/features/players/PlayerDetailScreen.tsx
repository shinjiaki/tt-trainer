import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Calendar, type CalendarMark, LevelBadge } from '@/components';
import { Icon } from '@/icons';
import { monthAttendance, playerAttendance } from '@/store/selectors';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import { formatDateLong, MONTHS_SHORT } from '@/utils/date';

import { PlayerSheet } from './PlayerSheet';

const pad2 = (n: number) => String(n).padStart(2, '0');

export function PlayerDetailScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const players = useStore((s) => s.players);
  const gyms = useStore((s) => s.gyms);
  const sessions = useStore((s) => s.sessions);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const deletePlayer = useStore((s) => s.deletePlayer);

  const player = players.find((p) => p.id === id) ?? null;

  const [editing, setEditing] = useState(false);
  const now = new Date();
  const [cal, setCal] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const att = useMemo(
    () => (player ? monthAttendance(sessions, player.id, cal.year, cal.month) : null),
    [sessions, player, cal],
  );

  const marks = useMemo(() => {
    const m: Record<string, CalendarMark> = {};
    att?.byDay.forEach((v, day) => {
      m[`${cal.year}-${pad2(cal.month + 1)}-${pad2(day)}`] = {
        dot: v.present > 0 ? colors.good : undefined,
        ring: v.absent > 0 ? colors.danger : undefined,
        count: v.present > 1 ? v.present : undefined,
      };
    });
    return m;
  }, [att, cal, colors]);

  // Attendance entries within the visible month, most recent first.
  const monthEntries = useMemo(() => {
    if (!player) return [];
    return playerAttendance(sessions, player.id)
      .filter((e) => {
        const [y, mo] = e.date.split('-').map(Number);
        return y === cal.year && mo - 1 === cal.month;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, player, cal]);

  if (!player) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          paddingTop: insets.top,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <Text style={{ fontFamily: fonts.ui600, fontSize: 16, color: colors.text }}>
          Jogador não encontrado
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontFamily: fonts.ui600, fontSize: 14, color: colors.primary }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const playerGyms = gyms.filter((g) => player.gymIds.includes(g.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={{ flex: 1, fontFamily: fonts.display700, fontSize: 20, color: colors.text }}
        >
          {player.name}
        </Text>
        <Button variant="soft" size="sm" icon="edit" onPress={() => setEditing(true)}>
          Editar
        </Button>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 24, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* profile */}
        <View
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
          <Avatar player={player} size={54} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LevelBadge level={player.level} small />
              <Text style={{ fontFamily: fonts.ui400, fontSize: 12.5, color: colors.textFaint }}>
                {player.hand}
              </Text>
            </View>
            {playerGyms.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {playerGyms.map((g) => (
                  <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: g.color }} />
                    <Text style={{ fontFamily: fonts.ui600, fontSize: 11.5, color: colors.textMuted }}>
                      {g.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* attendance summary */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SummaryStat
            value={att?.totalPresent ?? 0}
            label={(att?.totalPresent ?? 0) === 1 ? 'aula' : 'aulas'}
            color={colors.good}
          />
          <SummaryStat
            value={att?.totalAbsent ?? 0}
            label={(att?.totalAbsent ?? 0) === 1 ? 'falta' : 'faltas'}
            color={colors.danger}
          />
        </View>

        {/* calendar */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 14,
          }}
        >
          <Calendar
            year={cal.year}
            month={cal.month}
            marks={marks}
            onChangeMonth={(year, month) => setCal({ year, month })}
          />
          {/* legend */}
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 10, paddingHorizontal: 4 }}>
            <Legend color={colors.good} label="Presença" />
            <Legend color={colors.danger} label="Falta" ring />
          </View>
        </View>

        {/* month entries */}
        {monthEntries.length > 0 && (
          <View style={{ gap: 8 }}>
            {monthEntries.map((e) => (
              <View
                key={e.sessionId}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                }}
              >
                <Icon
                  name={e.status === 'present' ? 'check' : 'close'}
                  size={17}
                  color={e.status === 'present' ? colors.good : colors.danger}
                />
                <Text style={{ flex: 1, fontFamily: fonts.ui600, fontSize: 14, color: colors.text }}>
                  {formatDateLong(e.date)}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.ui600,
                    fontSize: 12.5,
                    color: e.status === 'present' ? colors.good : colors.danger,
                  }}
                >
                  {e.status === 'present' ? 'Presente' : 'Falta'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {monthEntries.length === 0 && (
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 8,
              fontFamily: fonts.ui400,
              fontSize: 13.5,
              color: colors.textFaint,
            }}
          >
            Sem registros em {MONTHS_SHORT[cal.month]}.
          </Text>
        )}
      </ScrollView>

      <PlayerSheet
        editing={editing ? player : null}
        gyms={gyms}
        onClose={() => setEditing(false)}
        onSave={(draft) => {
          updatePlayer(player.id, draft);
          setEditing(false);
        }}
        onDelete={() => {
          deletePlayer(player.id);
          setEditing(false);
          router.back();
        }}
      />
    </View>
  );
}

function SummaryStat({ value, label, color }: { value: number; label: string; color: string }) {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontFamily: fonts.display700, fontSize: 28, color }}>{value}</Text>
      <Text style={{ fontFamily: fonts.ui500, fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
        {label} no mês
      </Text>
    </View>
  );
}

function Legend({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 9,
          height: 9,
          borderRadius: 5,
          backgroundColor: ring ? 'transparent' : color,
          borderWidth: ring ? 1.4 : 0,
          borderColor: color,
        }}
      />
      <Text style={{ fontFamily: fonts.ui500, fontSize: 12, color: colors.textMuted }}>{label}</Text>
    </View>
  );
}
