import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  BottomSheet,
  Button,
  Screen,
  SectionLabel,
  SegmentedControl,
  Stepper,
  TextField,
  Toggle,
} from '@/components';
import { Icon, type IconName } from '@/icons';
import type { MoveMode, ThemeName, TrainingLayout } from '@/models/types';
import { useStore } from '@/store/useStore';
import { AccentOptions, Themes, useTheme } from '@/theme';
import { initials } from '@/utils/text';

const THEME_OPTIONS: { key: ThemeName; label: string }[] = [
  { key: 'azul', label: 'Azul' },
  { key: 'escuro', label: 'Escuro' },
  { key: 'verde', label: 'Verde' },
];

/** Keep in sync with app.json → expo.version. */
const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const { colors, fonts } = useTheme();
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const [editingProfile, setEditingProfile] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.trainerName);

  return (
    <Screen contentStyle={{ gap: 22 }}>
      {/* profile */}
      <Pressable
        onPress={() => {
          setNameDraft(settings.trainerName);
          setEditingProfile(true);
        }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontFamily: fonts.display700, fontSize: 21 }}>
            {initials(settings.trainerName)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.display700, fontSize: 19, color: colors.text }}>
            {settings.trainerName}
          </Text>
          <Text style={{ fontFamily: fonts.ui400, fontSize: 13, color: colors.textMuted }}>
            Treinador · Editar perfil
          </Text>
        </View>
        <Icon name="edit" size={20} color={colors.textFaint} />
      </Pressable>

      {/* appearance */}
      <View>
        <SectionLabel>Aparência</SectionLabel>
        <Group>
          <View style={{ padding: 14, gap: 10 }}>
            <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.text }}>
              Tema
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {THEME_OPTIONS.map((opt) => {
                const palette = Themes[opt.key];
                const active = settings.theme === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => updateSettings({ theme: opt.key })}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: 'center',
                      gap: 7,
                      backgroundColor: palette.colors.surface,
                      borderWidth: 2,
                      borderColor: active ? palette.colors.primary : colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 5,
                          backgroundColor: palette.colors.primary,
                        }}
                      />
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 5,
                          backgroundColor: palette.colors.accent,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: fonts.ui600,
                        fontSize: 11.5,
                        color: palette.colors.text,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={{ padding: 14, gap: 10 }}>
            <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.text }}>
              Cor de destaque
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {AccentOptions.map((pair) => {
                const active = settings.accent[0].toLowerCase() === pair[0].toLowerCase();
                return (
                  <Pressable
                    key={pair[0]}
                    onPress={() => updateSettings({ accent: pair })}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: pair[0],
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 3,
                      borderColor: active ? colors.text : 'transparent',
                    }}
                  >
                    {active && <Icon name="check" size={18} color="#fff" strokeWidth={2.6} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Group>
      </View>

      {/* training */}
      <View>
        <SectionLabel>Treino</SectionLabel>
        <Group>
          <Row
            icon="timer"
            title="Duração do jogo"
            sub="Tempo sugerido por rodada (Not working)"
            right={
              <Stepper
                compact
                value={settings.defaultGameMinutes}
                onChange={(v) => updateSettings({ defaultGameMinutes: v })}
                min={1}
                max={60}
                unit="min"
              />
            }
          />
          <Row
            icon="bell"
            title="Alerta de rodízio"
            sub="Som ao fim do tempo do jogo (Not working)"
            right={
              <Toggle
                on={settings.rotationAlert}
                onChange={(v) => updateSettings({ rotationAlert: v })}
              />
            }
          />
          <Row
            icon="paddle"
            title="Manter tela ligada"
            sub="Durante o treino ativo (Not working)"
            right={
              <Toggle
                on={settings.keepScreenAwake}
                onChange={(v) => updateSettings({ keepScreenAwake: v })}
              />
            }
          />
          <View style={{ padding: 14, gap: 10 }}>
            <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.text }}>
              Layout das mesas
            </Text>
            <SegmentedControl<TrainingLayout>
              value={settings.trainingLayout}
              options={[
                { label: 'Vista de cima', value: 'topdown' },
                { label: 'Lista', value: 'list' },
              ]}
              onChange={(v) => updateSettings({ trainingLayout: v })}
            />
          </View>
          <View style={{ padding: 14, gap: 10 }}>
            <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.text }}>
              Mover jogadores
            </Text>
            <SegmentedControl<MoveMode>
              value={settings.moveMode}
              options={[
                { label: 'Arrastar', value: 'drag' },
                { label: 'Tocar', value: 'tap' },
                { label: 'Ambos', value: 'both' },
              ]}
              onChange={(v) => updateSettings({ moveMode: v })}
            />
          </View>
        </Group>
      </View>

      {/* app */}
      <View>
        <SectionLabel>Aplicativo</SectionLabel>
        <Group>
          <Row
            icon="bell"
            title="Sons e vibração (Not working)"
            right={
              <Toggle
                on={settings.soundVibration}
                onChange={(v) => updateSettings({ soundVibration: v })}
              />
            }
          />
          <Row
            icon="dot"
            title="Idioma"
            sub="Português (Brasil)"
            right={<Icon name="chevron" size={18} color={colors.textFaint} />}
          />
          <Row
            icon="info"
            title="Sobre o app"
            sub={`Versão ${APP_VERSION}`}
            onPress={() => setAboutOpen(true)}
            right={<Icon name="chevron" size={18} color={colors.textFaint} />}
          />
        </Group>
      </View>

      <BottomSheet
        open={editingProfile}
        onClose={() => setEditingProfile(false)}
        title="Editar perfil"
      >
        <View style={{ gap: 18 }}>
          <TextField
            label="Nome do treinador"
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="Seu nome"
          />
          <Button
            full
            size="lg"
            icon="check"
            onPress={() => {
              updateSettings({ trainerName: nameDraft.trim() || settings.trainerName });
              setEditingProfile(false);
            }}
          >
            Salvar perfil
          </Button>
        </View>
      </BottomSheet>

      <BottomSheet open={aboutOpen} onClose={() => setAboutOpen(false)} title="Sobre o app">
        <View style={{ gap: 22, paddingTop: 4 }}>
          {/* app identity */}
          <View style={{ alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="paddle" size={38} color="#fff" />
            </View>
            <View style={{ alignItems: 'center', gap: 3 }}>
              <Text style={{ fontFamily: fonts.display700, fontSize: 22, color: colors.text }}>
                TT Trainer
              </Text>
              <View
                style={{
                  backgroundColor: colors.surfaceMuted,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 999,
                  paddingVertical: 3,
                  paddingHorizontal: 11,
                }}
              >
                <Text style={{ fontFamily: fonts.mono700, fontSize: 12, color: colors.textMuted }}>
                  v{APP_VERSION}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontFamily: fonts.ui400,
                fontSize: 13,
                color: colors.textMuted,
                textAlign: 'center',
                paddingHorizontal: 12,
              }}
            >
              Organize treinos de tênis de mesa: ginásios, quadras, jogadores e mesas.
            </Text>
          </View>

          {/* developer credit */}
          <View>
            <SectionLabel>Desenvolvido por</SectionLabel>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                backgroundColor: colors.surfaceMuted,
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
                  borderRadius: 14,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fonts.display700, fontSize: 17, color: '#fff' }}>
                  SD
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.display600, fontSize: 16, color: colors.text }}>
                  shin.dev
                </Text>
                <Text style={{ fontFamily: fonts.ui400, fontSize: 12.5, color: colors.textMuted }}>
                  Design & desenvolvimento
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              textAlign: 'center',
              fontFamily: fonts.ui400,
              fontSize: 11.5,
              color: colors.textFaint,
            }}
          >
            © 2026 shin.dev · Todos os direitos reservados
          </Text>
        </View>
      </BottomSheet>
    </Screen>
  );
}

function Group({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const items = Array.isArray(children) ? children.flat() : [children];
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {items.filter(Boolean).map((child, i) => (
        <View key={i}>
          {i > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 63 }} />}
          {child}
        </View>
      ))}
    </View>
  );
}

function Row({
  icon,
  title,
  sub,
  right,
  onPress,
}: {
  icon: IconName;
  title: string;
  sub?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const { colors, fonts } = useTheme();
  const Container = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 14,
        paddingVertical: 13,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={19} color={colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.ui600, fontSize: 14.5, color: colors.text }}>{title}</Text>
        {sub && (
          <Text style={{ fontFamily: fonts.ui400, fontSize: 12, color: colors.textMuted }}>
            {sub}
          </Text>
        )}
      </View>
      {right}
    </Container>
  );
}
