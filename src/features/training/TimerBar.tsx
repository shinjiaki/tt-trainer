import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { WHEEL_ITEM_HEIGHT, WHEEL_VISIBLE, WheelPicker } from '@/components/WheelPicker';
import { Icon } from '@/icons';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';
import { formatTime } from '@/utils/text';

/** Keep flashing the "time's up" box for this long, then settle if untouched. */
const FLASH_MS = 5000;

const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0–59
const SECONDS = Array.from({ length: 60 }, (_, i) => i); // 0–59

/** Training timer (§5.5 / §3.6): count-up stopwatch or a count-down timer. */
export function TimerBar() {
  const { colors, fonts, radius } = useTheme();
  const timer = useStore((s) => s.timer);
  const tickTimer = useStore((s) => s.tickTimer);
  const toggleTimer = useStore((s) => s.toggleTimer);
  const resetTimer = useStore((s) => s.resetTimer);
  const setTimerDuration = useStore((s) => s.setTimerDuration);
  const { mode, seconds, running, finished } = timer;

  const [pickerOpen, setPickerOpen] = useState(false);
  // Draft wheel values while the picker is open.
  const [draftMin, setDraftMin] = useState(0);
  const [draftSec, setDraftSec] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [running, tickTimer]);

  // Seed the wheels from the current duration when the picker opens.
  const openPicker = () => {
    const base = timer.durationSeconds > 0 ? timer.durationSeconds : 300; // default 5:00
    setDraftMin(Math.floor(base / 60));
    setDraftSec(base % 60);
    setPickerOpen(true);
  };

  // "Time's up" pulse — flashes, then auto-settles after FLASH_MS if untouched.
  const pulse = useRef(new Animated.Value(0)).current;
  const [flashing, setFlashing] = useState(false);
  useEffect(() => {
    if (!finished) {
      setFlashing(false);
      return;
    }
    setFlashing(true);
    const stop = setTimeout(() => setFlashing(false), FLASH_MS);
    return () => clearTimeout(stop);
  }, [finished]);

  useEffect(() => {
    if (!flashing) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flashing, pulse]);

  const isCountdown = mode === 'countdown';
  const label = finished
    ? 'Tempo esgotado'
    : isCountdown
      ? 'Contagem regressiva'
      : 'Tempo de treino';

  // Resolve the bar background. While flashing it pulses between danger tones.
  const activeBg = finished ? colors.danger : running ? colors.accent : colors.surface;
  const onActive = finished || running;
  const backgroundColor = flashing
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [colors.danger, colors.warn] })
    : activeBg;
  const borderColor = onActive ? activeBg : colors.border;

  const draftTotal = draftMin * 60 + draftSec;
  // Center band sits at the middle row of the wheel.
  const bandTop = ((WHEEL_VISIBLE - 1) / 2) * WHEEL_ITEM_HEIGHT;

  return (
    <>
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor,
          borderWidth: 1,
          borderColor,
          borderRadius: 16,
          paddingVertical: 10,
          paddingLeft: 16,
          paddingRight: 12,
        }}
      >
        <Pressable
          onPress={openPicker}
          accessibilityLabel="Escolher tempo"
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.ui700,
                fontSize: 10.5,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: onActive ? 'rgba(255,255,255,0.85)' : colors.textFaint,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                fontFamily: fonts.mono700,
                fontSize: 30,
                letterSpacing: 1,
                color: onActive ? '#fff' : colors.text,
              }}
            >
              {formatTime(seconds)}
            </Text>
          </View>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: onActive ? 'rgba(255,255,255,0.16)' : colors.surfaceMuted,
            }}
          >
            <Icon name="clock" size={17} color={onActive ? '#fff' : colors.textMuted} />
          </View>
        </Pressable>

        <Pressable
          onPress={resetTimer}
          accessibilityLabel="Zerar"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: onActive ? 'rgba(255,255,255,0.18)' : colors.surfaceMuted,
          }}
        >
          <Icon name="reset" size={20} color={onActive ? '#fff' : colors.textMuted} />
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
            backgroundColor: onActive ? '#fff' : colors.primary,
          }}
        >
          <Icon
            name={running ? 'pause' : 'play'}
            size={22}
            color={onActive ? (finished ? colors.danger : colors.accent) : colors.onPrimary}
          />
        </Pressable>
      </Animated.View>

      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Tempo">
        <Text
          style={{
            fontFamily: fonts.ui500,
            fontSize: 13.5,
            color: colors.textMuted,
            marginBottom: 4,
            lineHeight: 19,
          }}
        >
          Deslize para escolher minutos e segundos.
        </Text>

        <View style={{ alignItems: 'center', paddingVertical: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
            {/* center selection band, drawn behind the transparent wheels */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: bandTop,
                left: 0,
                right: 0,
                height: WHEEL_ITEM_HEIGHT,
                borderRadius: radius.sm,
                backgroundColor: colors.surfaceMuted,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <View style={{ alignItems: 'center' }}>
              <WheelPicker values={MINUTES} selectedValue={draftMin} onChange={setDraftMin} />
            </View>
            <Text
              style={{
                fontFamily: fonts.mono700,
                fontSize: 28,
                color: colors.textMuted,
                marginHorizontal: 2,
              }}
            >
              :
            </Text>
            <View style={{ alignItems: 'center' }}>
              <WheelPicker values={SECONDS} selectedValue={draftSec} onChange={setDraftSec} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 70, marginTop: 2 }}>
            <Text
              style={{
                fontFamily: fonts.ui600,
                fontSize: 11,
                letterSpacing: 0.6,
                color: colors.textFaint,
              }}
            >
              MIN
            </Text>
            <Text
              style={{
                fontFamily: fonts.ui600,
                fontSize: 11,
                letterSpacing: 0.6,
                color: colors.textFaint,
              }}
            >
              SEG
            </Text>
          </View>
        </View>

        <Button
          variant="primary"
          size="lg"
          icon="timer"
          full
          onPress={() => {
            setTimerDuration(draftTotal);
            setPickerOpen(false);
          }}
          style={{ marginTop: 10 }}
        >
          {draftTotal > 0 ? `Definir ${formatTime(draftTotal)}` : 'Definir tempo'}
        </Button>

        <Pressable
          onPress={() => {
            setTimerDuration(0);
            setPickerOpen(false);
          }}
          style={{ alignItems: 'center', paddingVertical: 14, marginTop: 6 }}
        >
          <Text style={{ fontFamily: fonts.ui600, fontSize: 14, color: colors.textMuted }}>
            Usar cronômetro (contar a partir do zero)
          </Text>
        </Pressable>
      </BottomSheet>
    </>
  );
}
