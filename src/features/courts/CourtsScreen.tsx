import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Screen } from '@/components';
import type { Court } from '@/models/types';
import { getActiveSession } from '@/store/selectors';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';

import { CourtPreview } from './CourtPreview';
import { CourtSheet } from './CourtSheet';
import { GymDropdown } from './GymDropdown';

export function CourtsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const gyms = useStore((s) => s.gyms);
  const courts = useStore((s) => s.courts);
  const activeCourtId = useStore((s) => s.activeCourtId);
  const activeSession = useStore(getActiveSession);
  const selectedGymId = useStore((s) => s.selectedGymId);
  const setSelectedGymId = useStore((s) => s.setSelectedGymId);
  const setActiveCourtId = useStore((s) => s.setActiveCourtId);
  const addCourt = useStore((s) => s.addCourt);
  const updateCourt = useStore((s) => s.updateCourt);
  const deleteCourt = useStore((s) => s.deleteCourt);

  const [editing, setEditing] = useState<Court | 'new' | null>(null);

  const selectedGym = gyms.find((g) => g.id === selectedGymId) ?? gyms[0] ?? null;
  const visible = courts.filter((c) => c.gymId === selectedGym?.id);

  return (
    <Screen>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.ui700,
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: colors.textFaint,
              marginBottom: 4,
            }}
          >
            Quadras do ginásio
          </Text>
          <GymDropdown
            gyms={gyms}
            courts={courts}
            selectedGym={selectedGym}
            onSelect={setSelectedGymId}
            onManageGyms={() => router.navigate('/gyms')}
          />
          <Text
            style={{ fontFamily: fonts.ui400, fontSize: 13, color: colors.textMuted, marginTop: 3 }}
          >
            {visible.length} {visible.length === 1 ? 'quadra' : 'quadras'} neste ginásio
          </Text>
        </View>
        <Button icon="plus" size="sm" onPress={() => setEditing('new')}>
          Nova
        </Button>
      </View>

      <View style={{ gap: 14 }}>
        {visible.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 36,
              paddingHorizontal: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.borderStrong,
              borderRadius: 16,
              gap: 12,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.ui400,
                fontSize: 14,
                color: colors.textMuted,
                textAlign: 'center',
              }}
            >
              Nenhuma quadra em {selectedGym?.name ?? 'este ginásio'} ainda.
            </Text>
            <Button
              icon="plus"
              size="sm"
              onPress={() => setEditing('new')}
              style={{ alignSelf: 'center' }}
            >
              Cadastrar quadra
            </Button>
          </View>
        )}

        {visible.map((c) => {
          const active = c.id === activeCourtId;
          return (
            <View
              key={c.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 18,
                borderWidth: 1.5,
                borderColor: active ? colors.primary : colors.border,
                overflow: 'hidden',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 14, padding: 16 }}>
                <View
                  style={{
                    width: 104,
                    backgroundColor: colors.surfaceInset,
                    borderRadius: 12,
                    padding: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <CourtPreview cols={c.cols} count={c.tables.length} small />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                  >
                    <Text
                      style={{ fontFamily: fonts.display700, fontSize: 18, color: colors.text }}
                    >
                      {c.name}
                    </Text>
                    {active && (
                      <View
                        style={{
                          backgroundColor: colors.primarySoft,
                          borderRadius: 999,
                          paddingVertical: 2,
                          paddingHorizontal: 9,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: fonts.ui700,
                            fontSize: 10.5,
                            letterSpacing: 0.4,
                            textTransform: 'uppercase',
                            color: colors.primary,
                          }}
                        >
                          Ativa
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.ui400,
                      fontSize: 13,
                      color: colors.textMuted,
                      marginTop: 3,
                    }}
                  >
                    {c.tables.length} mesas · {c.cols} {c.cols > 1 ? 'colunas' : 'coluna'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    {active ? (
                      <Button
                        icon="play"
                        size="sm"
                        onPress={() =>
                          router.navigate(activeSession ? '/(tabs)/training' : '/session-setup')
                        }
                      >
                        Treinar
                      </Button>
                    ) : (
                      <Button variant="soft" size="sm" onPress={() => setActiveCourtId(c.id)}>
                        Usar
                      </Button>
                    )}
                    <Button variant="ghost" icon="edit" size="sm" onPress={() => setEditing(c)}>
                      Editar
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <CourtSheet
        editing={editing}
        onClose={() => setEditing(null)}
        onSave={(draft) => {
          if (editing === 'new') {
            if (selectedGym) addCourt({ gymId: selectedGym.id, ...draft });
          } else if (editing) {
            updateCourt(editing.id, draft);
          }
          setEditing(null);
        }}
        onDelete={() => {
          if (editing && editing !== 'new') deleteCourt(editing.id);
          setEditing(null);
        }}
      />
    </Screen>
  );
}
