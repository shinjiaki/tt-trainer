import { Pressable, Text, View } from 'react-native';

import { Avatar, BottomSheet, LevelBadge } from '@/components';
import { Icon } from '@/icons';
import type { Player, TrainingSession } from '@/models/types';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import { formatDateLong, formatDuration, minutesBetween } from '@/utils/date';

interface SessionHistorySheetProps {
  session: TrainingSession | null;
  onClose: () => void;
}

/** Read-only summary of a finished training session, with a delete action. */
export function SessionHistorySheet({ session, onClose }: SessionHistorySheetProps) {
  const { colors, fonts } = useTheme();
  const players = useStore((s) => s.players);
  const gyms = useStore((s) => s.gyms);
  const deleteSession = useStore((s) => s.deleteSession);

  const gym = gyms.find((g) => g.id === session?.gymId) ?? null;

  const byId = new Map(players.map((p) => [p.id, p]));
  const resolve = (ids: string[]): Player[] =>
    ids.map((id) => byId.get(id)).filter((p): p is Player => Boolean(p));

  const present = session ? resolve(session.rosterIds.filter((id) => !session.noShowIds.includes(id))) : [];
  const absent = session ? resolve(session.noShowIds) : [];

  return (
    <BottomSheet
      open={session !== null}
      onClose={onClose}
      title={session ? formatDateLong(session.date) : ''}
    >
      {session && (
        <View style={{ gap: 18 }}>
          {/* meta */}
          <View style={{ gap: 6 }}>
            <Meta icon="gym">{gym?.name ?? 'Ginásio'}</Meta>
            <Meta icon="clock">
              {session.startTime}–{session.endTime} ·{' '}
              {formatDuration(minutesBetween(session.startTime, session.endTime))}
            </Meta>
          </View>

          <Group title={`Presentes · ${present.length}`}>
            {present.length === 0 ? (
              <Empty>Ninguém marcado como presente.</Empty>
            ) : (
              present.map((p) => <PlayerRow key={p.id} player={p} />)
            )}
          </Group>

          {absent.length > 0 && (
            <Group title={`Faltas · ${absent.length}`}>
              {absent.map((p) => (
                <PlayerRow key={p.id} player={p} muted />
              ))}
            </Group>
          )}

          <Pressable
            onPress={() => {
              deleteSession(session.id);
              onClose();
            }}
            style={{ alignSelf: 'center', padding: 6 }}
          >
            <Text style={{ color: colors.danger, fontFamily: fonts.ui600, fontSize: 14 }}>
              Excluir treino
            </Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

function Meta({ icon, children }: { icon: 'gym' | 'clock'; children: React.ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={icon} size={15} color={colors.textMuted} />
      <Text style={{ fontFamily: fonts.ui500, fontSize: 13.5, color: colors.textMuted }}>
        {children}
      </Text>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <View>
      <Text
        style={{
          fontFamily: fonts.ui600,
          fontSize: 12.5,
          color: colors.textFaint,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function PlayerRow({ player, muted }: { player: Player; muted?: boolean }) {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.surfaceMuted,
        borderRadius: 13,
        padding: 8,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <Avatar player={player} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>
          {player.name}
        </Text>
        <LevelBadge level={player.level} small />
      </View>
    </View>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <Text style={{ fontFamily: fonts.ui400, fontSize: 14, color: colors.textFaint }}>{children}</Text>
  );
}
