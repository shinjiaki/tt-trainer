import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Card, Screen, SectionLabel } from '@/components';
import { Icon, type IconName } from '@/icons';
import type { Court } from '@/models/types';
import { getActiveSession, placedCountForCourt } from '@/store/selectors';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import { initials } from '@/utils/text';

export function HomeScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const trainerName = useStore((s) => s.settings.trainerName);
  const players = useStore((s) => s.players);
  const courts = useStore((s) => s.courts);
  const gyms = useStore((s) => s.gyms);
  const assignments = useStore((s) => s.assignments);
  const activeCourtId = useStore((s) => s.activeCourtId);
  const activeSession = useStore(getActiveSession);

  const goTrain = () => router.navigate(activeSession ? '/(tabs)/training' : '/session-setup');

  const activeCourt = courts.find((c) => c.id === activeCourtId) ?? null;
  const activeGym = gyms.find((g) => g.id === activeCourt?.gymId) ?? null;
  const gymPlayers = activeGym ? players.filter((p) => p.gymIds.includes(activeGym.id)) : [];
  const gymCourts = activeGym ? courts.filter((c) => c.gymId === activeGym.id) : [];
  const placed = placedCountForCourt(activeCourt, assignments);

  return (
    <Screen contentStyle={{ gap: 18 }}>
      {/* greeting */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: fonts.ui500, fontSize: 13.5, color: colors.textMuted }}>
            Bom treino,
          </Text>
          <Text style={{ fontFamily: fonts.display700, fontSize: 25, color: colors.text }}>
            {trainerName} 🏓
          </Text>
        </View>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontFamily: fonts.display700, fontSize: 18 }}>
            {initials(trainerName)}
          </Text>
        </View>
      </View>

      {/* active court hero */}
      {activeCourt ? (
        <View style={{ borderRadius: 22, overflow: 'hidden', padding: 18 }}>
          <HeroGradient from={colors.primary} to={colors.primaryDim} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fonts.ui700,
                  fontSize: 11,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                Quadra ativa
              </Text>
              <Text
                style={{ fontFamily: fonts.display700, fontSize: 24, color: '#fff', marginTop: 2 }}
              >
                {activeCourt.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <Icon name="gym" size={14} color="#fff" />
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: fonts.ui500,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.9)',
                    flexShrink: 1,
                  }}
                >
                  {activeGym?.name ?? ''}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: fonts.ui500,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: 1,
                }}
              >
                {activeCourt.tables.length} mesas · {placed} em jogo
              </Text>
            </View>
            <MiniCourt court={activeCourt} />
          </View>

          <Pressable
            onPress={goTrain}
            style={{
              marginTop: 16,
              backgroundColor: '#fff',
              borderRadius: 14,
              paddingVertical: 13,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon name="play" size={18} color={colors.primary} />
            <Text style={{ fontFamily: fonts.ui700, fontSize: 15.5, color: colors.primary }}>
              {activeSession ? 'Continuar treino' : 'Iniciar treino'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Card
          onPress={() => router.navigate('/(tabs)/courts')}
          style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}
        >
          <Icon name="court" size={28} color={colors.textFaint} />
          <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>
            Nenhuma quadra ativa
          </Text>
          <Text style={{ fontFamily: fonts.ui400, fontSize: 13, color: colors.textMuted }}>
            Toque para escolher uma quadra
          </Text>
        </Card>
      )}

      {/* stats */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat icon="players" value={gymPlayers.length} label="Jogadores" />
        <Stat icon="court" value={gymCourts.length} label="Quadras" tone="accent" />
        <Stat icon="paddle" value={activeCourt?.tables.length ?? 0} label="Mesas" />
      </View>

      {/* shortcuts */}
      <View>
        <SectionLabel>Atalhos</SectionLabel>
        <View style={{ gap: 10 }}>
          <Shortcut
            icon="gym"
            title="Cadastrar Ginásio"
            subtitle="Gerencie seus locais de treino"
            onPress={() => router.navigate('/gyms')}
          />
          <Shortcut
            icon="court"
            title="Gerenciar quadras"
            subtitle="Monte o layout das mesas"
            onPress={() => router.navigate('/(tabs)/courts')}
          />
          <Shortcut
            icon="players"
            title="Cadastrar jogador"
            subtitle="Adicione alunos ao seu grupo"
            onPress={() => router.navigate('/(tabs)/players')}
          />
        </View>
      </View>
    </Screen>
  );
}

function HeroGradient({ from, to }: { from: string; to: string }) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      {size.width > 0 && size.height > 0 && (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.width} height={size.height} fill="url(#hero)" />
        </Svg>
      )}
    </View>
  );
}

function MiniCourt({ court }: { court: Court }) {
  const cols = court.cols || 2;
  const rows = Math.ceil(court.tables.length / cols);
  return (
    <View
      style={{
        width: 92,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: 10,
        padding: 6,
        gap: 5,
      }}
    >
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 5 }}>
          {Array.from({ length: cols }).map((__, c) => {
            const has = r * cols + c < court.tables.length;
            return (
              <View key={c} style={{ flex: 1 }}>
                {has && (
                  <View
                    style={{
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.42)',
                      flexDirection: 'row',
                    }}
                  >
                    <View
                      style={{
                        width: '38%',
                        borderRightWidth: 1.5,
                        borderStyle: 'dashed',
                        borderColor: 'rgba(255,255,255,0.5)',
                      }}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
  tone,
}: {
  icon: IconName;
  value: number;
  label: string;
  tone?: 'accent';
}) {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          marginBottom: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tone === 'accent' ? colors.accentSoft : colors.primarySoft,
        }}
      >
        <Icon name={icon} size={19} color={tone === 'accent' ? colors.accent : colors.primary} />
      </View>
      <Text style={{ fontFamily: fonts.display700, fontSize: 26, color: colors.text }}>
        {value}
      </Text>
      <Text
        style={{ fontFamily: fonts.ui500, fontSize: 12.5, color: colors.textMuted, marginTop: 3 }}
      >
        {label}
      </Text>
    </View>
  );
}

function Shortcut({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Card
      onPress={onPress}
      padding={12}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}
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
        <Icon name={icon} size={21} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.ui600, fontSize: 15, color: colors.text }}>{title}</Text>
        <Text style={{ fontFamily: fonts.ui400, fontSize: 12.5, color: colors.textMuted }}>
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron" size={18} color={colors.textFaint} />
    </Card>
  );
}
