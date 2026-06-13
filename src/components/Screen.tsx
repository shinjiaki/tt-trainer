import type { ReactNode } from 'react';
import { ScrollView, type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Scrollable screen wrapper: themed bg + top safe-area inset + base padding. */
export function Screen({ children, contentStyle }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          { paddingTop: insets.top + 8, paddingBottom: 28, paddingHorizontal: 16 },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}
