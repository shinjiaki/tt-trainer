import { useEffect, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

export const WHEEL_ITEM_HEIGHT = 44;
/** Visible rows (must be odd so one sits in the center). */
export const WHEEL_VISIBLE = 5;
const PAD = ((WHEEL_VISIBLE - 1) / 2) * WHEEL_ITEM_HEIGHT;

interface WheelPickerProps {
  /** Ordered list of selectable values. */
  values: number[];
  selectedValue: number;
  onChange: (v: number) => void;
  width?: number;
}

/**
 * iOS-style vertical scroll wheel. Snaps each value to the center band; the
 * centered value is committed via `onChange` as the user scrolls.
 */
export function WheelPicker({ values, selectedValue, onChange, width = 70 }: WheelPickerProps) {
  const { colors, fonts } = useTheme();
  const ref = useRef<ScrollView>(null);
  // -1 forces the initial scroll-into-position; afterwards it mirrors the
  // centered index so self-induced changes don't fight the user's scroll.
  const lastIndex = useRef(-1);

  useEffect(() => {
    const idx = values.indexOf(selectedValue);
    if (idx < 0 || idx === lastIndex.current) return;
    lastIndex.current = idx;
    ref.current?.scrollTo({ y: idx * WHEEL_ITEM_HEIGHT, animated: false });
  }, [selectedValue, values]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT);
    const idx = Math.max(0, Math.min(values.length - 1, raw));
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      onChange(values[idx]);
    }
  };

  return (
    <View style={{ height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE, width }}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingVertical: PAD }}
      >
        {values.map((v) => {
          const selected = v === selectedValue;
          return (
            <View
              key={v}
              style={{ height: WHEEL_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text
                style={{
                  fontFamily: fonts.mono700,
                  fontSize: selected ? 28 : 22,
                  color: selected ? colors.text : colors.textFaint,
                  opacity: selected ? 1 : 0.55,
                }}
              >
                {String(v).padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
