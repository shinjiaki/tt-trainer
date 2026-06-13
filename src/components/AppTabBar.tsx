import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/icons';
import { useTheme } from '@/theme';

interface NavItem {
  name: string;
  label: string;
  icon: IconName;
}

/** 5 fixed tabs (§4). "Treino" highlights with accent instead of primary. */
const NAV: NavItem[] = [
  { name: 'index', label: 'Início', icon: 'home' },
  { name: 'courts', label: 'Quadras', icon: 'court' },
  { name: 'training', label: 'Treino', icon: 'paddle' },
  { name: 'players', label: 'Jogadores', icon: 'players' },
  { name: 'settings', label: 'Ajustes', icon: 'settings' },
];

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 6,
        paddingBottom: Math.max(insets.bottom, 6),
        paddingHorizontal: 6,
      }}
    >
      {NAV.map((item) => {
        const focused = activeRoute === item.name;
        const isTraining = item.name === 'training';
        const pillBg = focused
          ? isTraining
            ? colors.accentSoft
            : colors.primarySoft
          : 'transparent';
        const fg = focused ? (isTraining ? colors.accent : colors.primary) : colors.textFaint;

        return (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes.find((r) => r.name === item.name)?.key ?? '',
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(item.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 }}
          >
            <View
              style={{
                width: 56,
                height: 30,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pillBg,
              }}
            >
              <Icon name={item.icon} size={22} color={fg} strokeWidth={focused ? 2.1 : 1.8} />
            </View>
            <Text
              style={{
                fontFamily: focused ? fonts.ui700 : fonts.ui500,
                fontSize: 10.5,
                letterSpacing: 0.1,
                color: fg,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
