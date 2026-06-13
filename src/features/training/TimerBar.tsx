import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/icons';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import { formatTime } from '@/utils/text';

/** General training timer (counts up) — §5.5 / §3.6. */
export function TimerBar() {
  const { colors, fonts } = useTheme();
  const timer = useStore((s) => s.timer);
  const tickTimer = useStore((s) => s.tickTimer);
  const toggleTimer = useStore((s) => s.toggleTimer);
  const resetTimer = useStore((s) => s.resetTimer);
  const { seconds, running } = timer;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [running, tickTimer]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: running ? colors.accent : colors.surface,
        borderWidth: 1,
        borderColor: running ? colors.accent : colors.border,
        borderRadius: 16,
        paddingVertical: 10,
        paddingLeft: 16,
        paddingRight: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.ui700,
            fontSize: 10.5,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: running ? 'rgba(255,255,255,0.85)' : colors.textFaint,
          }}
        >
          Tempo de treino
        </Text>
        <Text
          style={{
            fontFamily: fonts.mono700,
            fontSize: 30,
            letterSpacing: 1,
            color: running ? '#fff' : colors.text,
          }}
        >
          {formatTime(seconds)}
        </Text>
      </View>

      <Pressable
        onPress={resetTimer}
        accessibilityLabel="Zerar"
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: running ? 'rgba(255,255,255,0.18)' : colors.surfaceMuted,
        }}
      >
        <Icon name="reset" size={20} color={running ? '#fff' : colors.textMuted} />
      </Pressable>

      <Pressable
        onPress={toggleTimer}
        accessibilityLabel={running ? 'Pausar' : 'Iniciar'}
        style={{
          width: 50,
          height: 42,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: running ? '#fff' : colors.primary,
        }}
      >
        <Icon name={running ? 'pause' : 'play'} size={22} color={running ? colors.accent : colors.onPrimary} />
      </Pressable>
    </View>
  );
}
