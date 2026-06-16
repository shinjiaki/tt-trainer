import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen, SectionLabel } from '@/components';
import { Icon } from '@/icons';
import type { TrainingSession } from '@/models/types';
import { finishedSessions } from '@/store/selectors';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import {
  formatDateLong,
  formatDuration,
  formatMonthYear,
  minutesBetween,
  parseISODate,
} from '@/utils/date';

import { SessionHistorySheet } from './SessionHistorySheet';

export function TrainingLobbyScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const sessions = useStore((s) => s.sessions);
  const gyms = useStore((s) => s.gyms);

  const [detail, setDetail] = useState<TrainingSession | null>(null);
  const [histMonth, setHistMonth] = useState(() => {
    const latest = finishedSessions(sessions)[0];
    const d = latest ? parseISODate(latest.date) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const history = useMemo(() => finishedSessions(sessions), [sessions]);
  const monthHistory = useMemo(
    () =>
      history.filter((s) => {
        const d = parseISODate(s.date);
        return d.getFullYear() === histMonth.year && d.getMonth() === histMonth.month;
      }),
    [history, histMonth],
  );
  const stepMonth = (delta: number) =>
    setHistMonth((m) => {
      const d = new Date(m.year, m.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const gymName = (id: string) => gyms.find((g) => g.id === id)?.name ?? 'Ginásio';

  return (
    <Screen contentStyle={{ gap: 18 }}>
      {/* header */}
      <View>
        <Text style={{ fontFamily: fonts.display700, fontSize: 25, color: colors.text }}>
          Treino
        </Text>
        <Text style={{ fontFamily: fonts.ui400, fontSize: 13, color: colors.textMuted }}>
          Inicie um treino ou veja o histórico
        </Text>
      </View>

      {/* start CTA */}
      <Pressable
        onPress={() => router.navigate('/session-setup')}
        style={{ borderRadius: 20, overflow: 'hidden' }}
      >
        <View style={{ backgroundColor: colors.primary, padding: 20, gap: 12 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="whistle" size={24} color="#fff" />
          </View>
          <View>
            <Text style={{ fontFamily: fonts.display700, fontSize: 20, color: '#fff' }}>
              Iniciar treino
            </Text>
            <Text style={{ fontFamily: fonts.ui400, fontSize: 13.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              Escolha local, horário e os jogadores
            </Text>
          </View>
        </View>
      </Pressable>

      {/* history */}
      <View>
        <SectionLabel>Histórico</SectionLabel>

        {/* month navigator */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <MonthNav icon="back" onPress={() => stepMonth(-1)} />
          <Text style={{ fontFamily: fonts.display600, fontSize: 16, color: colors.text }}>
            {formatMonthYear(histMonth.year, histMonth.month)}
          </Text>
          <MonthNav icon="chevron" onPress={() => stepMonth(1)} />
        </View>

        {monthHistory.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 32,
              paddingHorizontal: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.borderStrong,
              borderRadius: 16,
              gap: 8,
            }}
          >
            <Icon name="history" size={26} color={colors.textFaint} />
            <Text style={{ fontFamily: fonts.ui400, fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>
              Nenhum treino em {formatMonthYear(histMonth.year, histMonth.month)}.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {monthHistory.map((s) => {
              const present = s.rosterIds.length - s.noShowIds.length;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setDetail(s)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 13,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 15,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: colors.surfaceMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="calendar" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>
                      {formatDateLong(s.date)}
                    </Text>
                    <Text style={{ fontFamily: fonts.ui400, fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
                      {gymName(s.gymId)}
                    </Text>
                    <Text style={{ fontFamily: fonts.ui500, fontSize: 12, color: colors.textFaint, marginTop: 2 }}>
                      {s.startTime}–{s.endTime} · {formatDuration(minutesBetween(s.startTime, s.endTime))} ·{' '}
                      {present} {present === 1 ? 'presente' : 'presentes'}
                      {s.noShowIds.length > 0
                        ? ` · ${s.noShowIds.length} ${s.noShowIds.length === 1 ? 'falta' : 'faltas'}`
                        : ''}
                    </Text>
                  </View>
                  <Icon name="chevron" size={18} color={colors.textFaint} />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <SessionHistorySheet session={detail} onClose={() => setDetail(null)} />
    </Screen>
  );
}

function MonthNav({ icon, onPress }: { icon: 'back' | 'chevron'; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={18} color={colors.textMuted} />
    </Pressable>
  );
}
