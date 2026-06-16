import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/icons';
import { useTheme } from '@/theme';

import { BottomSheet } from './BottomSheet';

interface TimeFieldProps {
  label?: string;
  /** 'HH:MM' */
  value: string;
  onChange: (value: string) => void;
  /** Minute granularity (default 5). */
  minuteStep?: number;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Tap-to-pick HH:MM control. Opens a sheet with hour + minute grids (web-safe). */
export function TimeField({ label, value, onChange, minuteStep = 5 }: TimeFieldProps) {
  const { colors, fonts } = useTheme();
  const [open, setOpen] = useState(false);

  const [hh, mm] = value.split(':').map(Number);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  const setHour = (h: number) => onChange(`${pad2(h)}:${pad2(mm)}`);
  const setMinute = (m: number) => onChange(`${pad2(hh)}:${pad2(m)}`);

  return (
    <View style={{ flex: 1 }}>
      {label && (
        <Text
          style={{
            fontFamily: fonts.ui600,
            fontSize: 12.5,
            color: colors.textMuted,
            marginBottom: 9,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1.5,
          borderColor: colors.border,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
        }}
      >
        <Icon name="clock" size={17} color={colors.textFaint} />
        <Text style={{ fontFamily: fonts.mono700, fontSize: 16, color: colors.text }}>{value}</Text>
      </Pressable>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Horário" maxHeightRatio={0.7}>
        <Grid label="Hora" items={hours} selected={hh} onPick={setHour} />
        <View style={{ height: 18 }} />
        <Grid label="Minuto" items={minutes} selected={mm} onPick={setMinute} />
        <View style={{ height: 6 }} />
      </BottomSheet>
    </View>
  );
}

function Grid({
  label,
  items,
  selected,
  onPick,
}: {
  label: string;
  items: number[];
  selected: number;
  onPick: (n: number) => void;
}) {
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
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((n) => {
          const on = n === selected;
          return (
            <Pressable
              key={n}
              onPress={() => onPick(n)}
              style={{
                width: 52,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: on ? colors.primary : colors.surfaceMuted,
                borderWidth: 1,
                borderColor: on ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.mono700,
                  fontSize: 15,
                  color: on ? '#fff' : colors.text,
                }}
              >
                {pad2(n)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
