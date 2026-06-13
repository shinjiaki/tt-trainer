import { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

import { useTheme } from '@/theme';

/** iOS-style switch (§5.7). */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: on ? 1 : 0, duration: 160, useNativeDriver: false }).start();
  }, [on, anim]);

  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 21] });
  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderStrong, colors.primary],
  });

  return (
    <Pressable onPress={() => onChange(!on)} accessibilityRole="switch" accessibilityState={{ checked: on }}>
      <Animated.View
        style={{ width: 46, height: 28, borderRadius: 999, backgroundColor: bg, justifyContent: 'center' }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            left,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
