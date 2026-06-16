import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, BottomSheet, Calendar, LevelBadge, TimeField } from '@/components';
import { GymDropdown } from '@/features/courts/GymDropdown';
import { WEEKDAYS } from '@/features/players/constants';
import { Icon } from '@/icons';
import type { Player, Weekday } from '@/models/types';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import { addMinutesHHMM, formatDateLong, nowHHMM, parseISODate, todayISO } from '@/utils/date';

export function SessionSetupScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const gyms = useStore((s) => s.gyms);
  const courts = useStore((s) => s.courts);
  const players = useStore((s) => s.players);
  const activeCourtId = useStore((s) => s.activeCourtId);
  const selectedGymId = useStore((s) => s.selectedGymId);
  const startSession = useStore((s) => s.startSession);

  // ── session config ─────────────────────────────────────
  const [gymId, setGymId] = useState<string | null>(() => {
    const fromCourt = courts.find((c) => c.id === activeCourtId)?.gymId;
    return selectedGymId ?? fromCourt ?? gyms[0]?.id ?? null;
  });
  const gymCourts = useMemo(() => courts.filter((c) => c.gymId === gymId), [courts, gymId]);
  const [courtId, setCourtId] = useState<string | null>(() => {
    const activeBelongs = courts.find((c) => c.id === activeCourtId)?.gymId;
    const initialGym = selectedGymId ?? activeBelongs ?? gyms[0]?.id ?? null;
    if (activeCourtId && activeBelongs === initialGym) return activeCourtId;
    return courts.find((c) => c.gymId === initialGym)?.id ?? null;
  });

  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState(nowHHMM());
  const [endTime, setEndTime] = useState(addMinutesHHMM(nowHHMM(), 120));
  const [dateOpen, setDateOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = parseISODate(todayISO());
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // ── roster selection ───────────────────────────────────
  const [roster, setRoster] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [rosterGym, setRosterGym] = useState<string | null>(gymId);
  const [weekday, setWeekday] = useState<Weekday | null>(null);

  const onSelectGym = (id: string) => {
    setGymId(id);
    setRosterGym(id);
    const courtsOfGym = courts.filter((c) => c.gymId === id);
    setCourtId(courtsOfGym.find((c) => c.id === courtId)?.id ?? courtsOfGym[0]?.id ?? null);
  };

  const filtered = useMemo(
    () =>
      players.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) &&
          (rosterGym === null || p.gymIds.includes(rosterGym)) &&
          (weekday === null || (p.weekdays ?? []).includes(weekday)),
      ),
    [players, query, rosterGym, weekday],
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => roster.includes(p.id));

  const toggle = (id: string) =>
    setRoster((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  const toggleAll = () =>
    setRoster((r) => {
      const ids = filtered.map((p) => p.id);
      if (allFilteredSelected) return r.filter((x) => !ids.includes(x));
      return Array.from(new Set([...r, ...ids]));
    });

  const selectedGym = gyms.find((g) => g.id === gymId) ?? null;
  const canStart = gymId !== null && courtId !== null && roster.length > 0;

  const onStart = () => {
    if (!gymId || roster.length === 0) return;
    startSession({ gymId, date, startTime, endTime, rosterIds: roster, initialCourtId: courtId });
    router.replace('/(tabs)/training');
  };

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
        <Text style={{ fontFamily: fonts.display700, fontSize: 20, color: colors.text }}>
          Configurar treino
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 22 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Local */}
        <Section title="Local">
          <View style={{ gap: 12 }}>
            <GymDropdown
              gyms={gyms}
              courts={courts}
              selectedGym={selectedGym}
              onSelect={onSelectGym}
              onManageGyms={() => router.navigate('/gyms')}
            />
            {gymCourts.length === 0 ? (
              <Text style={{ fontFamily: fonts.ui400, fontSize: 13.5, color: colors.textMuted }}>
                Este ginásio não tem quadras. Cadastre uma em Quadras.
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {gymCourts.map((c) => {
                  const on = c.id === courtId;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCourtId(c.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                        backgroundColor: on ? colors.primary : colors.surfaceMuted,
                        borderWidth: 1.5,
                        borderColor: on ? colors.primary : colors.border,
                        borderRadius: 12,
                        paddingVertical: 9,
                        paddingHorizontal: 13,
                      }}
                    >
                      <Icon name="court" size={15} color={on ? '#fff' : colors.textMuted} />
                      <Text
                        style={{
                          fontFamily: fonts.ui600,
                          fontSize: 13.5,
                          color: on ? '#fff' : colors.text,
                        }}
                      >
                        {c.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: fonts.ui500,
                          fontSize: 11.5,
                          color: on ? 'rgba(255,255,255,0.8)' : colors.textFaint,
                        }}
                      >
                        {c.tables.length} mesas
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {gymCourts.length > 1 && (
              <Text style={{ fontFamily: fonts.ui400, fontSize: 12.5, color: colors.textFaint }}>
                Quadra inicial · você pode alternar entre as quadras durante o treino.
              </Text>
            )}
          </View>
        </Section>

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
              {date === todayISO() && (
                <Text style={{ fontFamily: fonts.ui500, fontSize: 12.5, color: colors.textFaint }}>
                  · Hoje
                </Text>
              )}
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TimeField label="Início" value={startTime} onChange={setStartTime} />
              <TimeField label="Fim" value={endTime} onChange={setEndTime} />
            </View>
          </View>
        </Section>

        {/* Jogadores */}
        <Section
          title="Jogadores"
          extra={
            <Text style={{ fontFamily: fonts.ui600, fontSize: 13, color: colors.primary }}>
              {roster.length} selecionados
            </Text>
          }
        >
          <View style={{ gap: 12 }}>
            {/* search */}
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

            {/* gym filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <Chip label="Todos ginásios" active={rosterGym === null} onPress={() => setRosterGym(null)} />
              {gyms.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  color={g.color}
                  active={rosterGym === g.id}
                  onPress={() => setRosterGym((cur) => (cur === g.id ? null : g.id))}
                />
              ))}
            </ScrollView>

            {/* weekday filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 7 }}
            >
              <Chip label="Todo dia" active={weekday === null} onPress={() => setWeekday(null)} />
              {WEEKDAYS.map((d) => (
                <Chip
                  key={d.value}
                  label={d.short}
                  active={weekday === d.value}
                  onPress={() => setWeekday((cur) => (cur === d.value ? null : d.value))}
                />
              ))}
            </ScrollView>

            {/* select all */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.ui500, fontSize: 12.5, color: colors.textMuted }}>
                {filtered.length} {filtered.length === 1 ? 'jogador' : 'jogadores'} no filtro
              </Text>
              {filtered.length > 0 && (
                <Pressable onPress={toggleAll} hitSlop={6}>
                  <Text style={{ fontFamily: fonts.ui600, fontSize: 13, color: colors.primary }}>
                    {allFilteredSelected ? 'Limpar seleção' : 'Selecionar todos'}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* player list */}
            <View style={{ gap: 8 }}>
              {filtered.length === 0 ? (
                <Text
                  style={{
                    textAlign: 'center',
                    paddingVertical: 24,
                    fontFamily: fonts.ui400,
                    fontSize: 14,
                    color: colors.textFaint,
                  }}
                >
                  Nenhum jogador encontrado.
                </Text>
              ) : (
                filtered.map((p) => (
                  <PlayerRow key={p.id} player={p} selected={roster.includes(p.id)} onPress={() => toggle(p.id)} />
                ))
              )}
            </View>
          </View>
        </Section>
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
          onPress={onStart}
          disabled={!canStart}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            backgroundColor: canStart ? colors.primary : colors.surfaceMuted,
            borderRadius: 14,
            paddingVertical: 15,
            opacity: canStart ? 1 : 0.6,
          }}
        >
          <Icon name="play" size={20} color={canStart ? colors.onPrimary : colors.textFaint} />
          <Text
            style={{
              fontFamily: fonts.ui700,
              fontSize: 16,
              color: canStart ? colors.onPrimary : colors.textFaint,
            }}
          >
            Iniciar treino{roster.length > 0 ? ` · ${roster.length}` : ''}
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
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

function Chip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: active ? colors.primary : colors.surfaceMuted,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 13,
      }}
    >
      {color && <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: color }} />}
      <Text style={{ fontFamily: fonts.ui600, fontSize: 13, color: active ? '#fff' : colors.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}

function PlayerRow({
  player,
  selected,
  onPress,
}: {
  player: Player;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: selected ? colors.primarySoft : colors.surfaceMuted,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        borderRadius: 13,
        padding: 9,
      }}
    >
      <Avatar player={player} size={38} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>
          {player.name}
        </Text>
        <LevelBadge level={player.level} small />
      </View>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: selected ? colors.primary : colors.borderStrong,
          backgroundColor: selected ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <Icon name="check" size={15} color="#fff" strokeWidth={2.6} />}
      </View>
    </Pressable>
  );
}
