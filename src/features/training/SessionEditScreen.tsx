import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, BottomSheet, Calendar, LevelBadge, TimeField } from '@/components';
import { GymDropdown } from '@/features/courts/GymDropdown';
import { Icon } from '@/icons';
import type { Player } from '@/models/types';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import { formatDateLong, parseISODate } from '@/utils/date';

import { PlayerPickerSheet } from './PlayerPickerSheet';

export function SessionEditScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const sessions = useStore((s) => s.sessions);
  const gyms = useStore((s) => s.gyms);
  const courts = useStore((s) => s.courts);
  const players = useStore((s) => s.players);
  const updateSession = useStore((s) => s.updateSession);
  const deleteSession = useStore((s) => s.deleteSession);

  const session = sessions.find((s) => s.id === id) ?? null;

  const [gymId, setGymId] = useState<string | null>(session?.gymId ?? null);
  const [date, setDate] = useState(session?.date ?? '');
  const [startTime, setStartTime] = useState(session?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(session?.endTime ?? '10:00');
  const [roster, setRoster] = useState<string[]>(session?.rosterIds ?? []);
  const [absent, setAbsent] = useState<string[]>(session?.noShowIds ?? []);

  const [dateOpen, setDateOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = parseISODate(session?.date ?? new Date().toISOString().slice(0, 10));
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const rosterPlayers = roster
    .map((pid) => byId.get(pid))
    .filter((p): p is Player => Boolean(p));
  const candidates = players.filter((p) => !roster.includes(p.id));
  const presentCount = roster.length - absent.length;

  const selectedGym = gyms.find((g) => g.id === gymId) ?? null;

  const togglePresence = (pid: string) =>
    setAbsent((a) => (a.includes(pid) ? a.filter((x) => x !== pid) : [...a, pid]));
  const removePlayer = (pid: string) => {
    setRoster((r) => r.filter((x) => x !== pid));
    setAbsent((a) => a.filter((x) => x !== pid));
  };
  const addPlayer = (pid: string) => setRoster((r) => (r.includes(pid) ? r : [...r, pid]));

  const onSave = () => {
    if (!session) return;
    updateSession(session.id, {
      gymId: gymId ?? session.gymId,
      date,
      startTime,
      endTime,
      rosterIds: roster,
      noShowIds: absent,
    });
    router.back();
  };

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontFamily: fonts.ui600, fontSize: 16, color: colors.text }}>
          Treino não encontrado
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontFamily: fonts.ui600, fontSize: 14, color: colors.primary }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <Text style={{ flex: 1, fontFamily: fonts.display700, fontSize: 20, color: colors.text }}>
          Editar treino
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 22 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Quando */}
        <Section title="Quando">
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={() => setDateOpen(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: colors.surfaceMuted,
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
              }}
            >
              <Icon name="calendar" size={18} color={colors.textFaint} />
              <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>
                {formatDateLong(date)}
              </Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TimeField label="Início" value={startTime} onChange={setStartTime} />
              <TimeField label="Fim" value={endTime} onChange={setEndTime} />
            </View>
          </View>
        </Section>

        {/* Onde */}
        <Section title="Local">
          <GymDropdown
            gyms={gyms}
            courts={courts}
            selectedGym={selectedGym}
            onSelect={setGymId}
            onManageGyms={() => router.navigate('/gyms')}
          />
        </Section>

        {/* Jogadores */}
        <Section
          title="Jogadores"
          extra={
            <Text style={{ fontFamily: fonts.ui600, fontSize: 13, color: colors.primary }}>
              {presentCount} {presentCount === 1 ? 'presente' : 'presentes'}
              {absent.length > 0 ? ` · ${absent.length} ${absent.length === 1 ? 'falta' : 'faltas'}` : ''}
            </Text>
          }
        >
          <View style={{ gap: 8 }}>
            {rosterPlayers.length === 0 ? (
              <Text style={{ fontFamily: fonts.ui400, fontSize: 14, color: colors.textFaint, paddingVertical: 8 }}>
                Nenhum jogador. Adicione abaixo.
              </Text>
            ) : (
              rosterPlayers.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  absent={absent.includes(p.id)}
                  onToggle={() => togglePresence(p.id)}
                  onRemove={() => removePlayer(p.id)}
                />
              ))
            )}

            <Pressable
              onPress={() => setAddOpen(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: colors.primarySoft,
                borderRadius: 13,
                paddingVertical: 12,
                marginTop: 2,
              }}
            >
              <Icon name="userPlus" size={18} color={colors.primary} />
              <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.primary }}>
                Adicionar jogador
              </Text>
            </Pressable>
          </View>
        </Section>

        {/* delete */}
        <Pressable
          onPress={() => {
            deleteSession(session.id);
            router.back();
          }}
          style={{ alignSelf: 'center', padding: 8 }}
        >
          <Text style={{ color: colors.danger, fontFamily: fonts.ui600, fontSize: 14 }}>
            Excluir treino
          </Text>
        </Pressable>
      </ScrollView>

      {/* footer */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <Pressable
          onPress={onSave}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            backgroundColor: colors.primary,
            borderRadius: 14,
            paddingVertical: 15,
          }}
        >
          <Icon name="check" size={20} color={colors.onPrimary} />
          <Text style={{ fontFamily: fonts.ui700, fontSize: 16, color: colors.onPrimary }}>
            Salvar
          </Text>
        </Pressable>
      </View>

      {/* date picker */}
      <BottomSheet open={dateOpen} onClose={() => setDateOpen(false)} title="Data do treino" maxHeightRatio={0.7}>
        <Calendar
          year={calMonth.year}
          month={calMonth.month}
          selectedDate={date}
          onSelectDay={(iso) => {
            setDate(iso);
            setDateOpen(false);
          }}
          onChangeMonth={(year, month) => setCalMonth({ year, month })}
        />
      </BottomSheet>

      {/* add player */}
      <PlayerPickerSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Adicionar jogador"
        players={candidates}
        emptyText="Todos os jogadores já estão no treino."
        search
        onPick={(pid) => addPlayer(pid)}
      />
    </View>
  );
}

function Section({
  title,
  extra,
  children,
}: {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text
          style={{
            fontFamily: fonts.ui700,
            fontSize: 12,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: colors.textFaint,
          }}
        >
          {title}
        </Text>
        {extra}
      </View>
      {children}
    </View>
  );
}

function PlayerRow({
  player,
  absent,
  onToggle,
  onRemove,
}: {
  player: Player;
  absent: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { colors, fonts } = useTheme();
  const tone = absent ? colors.danger : colors.good;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 13,
        padding: 8,
      }}
    >
      <Avatar player={player} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>
          {player.name}
        </Text>
        <LevelBadge level={player.level} small />
      </View>
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: absent ? colors.surface : colors.goodSoft,
          borderWidth: 1,
          borderColor: tone,
          borderRadius: 999,
          paddingVertical: 5,
          paddingHorizontal: 10,
        }}
      >
        <Icon name={absent ? 'userMinus' : 'check'} size={14} color={tone} />
        <Text style={{ fontFamily: fonts.ui600, fontSize: 12.5, color: tone }}>
          {absent ? 'Falta' : 'Presente'}
        </Text>
      </Pressable>
      <Pressable onPress={onRemove} hitSlop={6} style={{ padding: 4 }}>
        <Icon name="close" size={18} color={colors.textFaint} />
      </Pressable>
    </View>
  );
}
