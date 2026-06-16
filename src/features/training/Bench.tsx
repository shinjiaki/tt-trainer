import { Pressable, ScrollView, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, type SharedValue } from 'react-native-reanimated';

import { Avatar } from '@/components';
import { Icon } from '@/icons';
import type { MoveMode, Player } from '@/models/types';
import { useTheme } from '@/theme';
import { firstName } from '@/utils/text';

interface DragCallbacks {
  onDragStart: (player: Player) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
  onDragClear: () => void;
}

interface BenchProps extends DragCallbacks {
  players: Player[];
  mode: MoveMode;
  selectedId: string | null;
  draggingId: string | null;
  onTapChip: (player: Player) => void;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  /** Optional quick-add affordance shown in the header. */
  onQuickAdd?: () => void;
}

export function Bench({
  players,
  mode,
  selectedId,
  draggingId,
  onTapChip,
  ghostX,
  ghostY,
  onQuickAdd,
  ...drag
}: BenchProps) {
  const { colors, fonts } = useTheme();

  const hint =
    mode === 'tap' ? 'toque p/ selecionar' : mode === 'drag' ? 'arraste p/ a mesa' : 'arraste ou toque';

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surfaceMuted, paddingTop: 10, paddingBottom: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="bench" size={17} color={colors.textMuted} />
          <Text style={{ fontFamily: fonts.display600, fontSize: 13.5, color: colors.text }}>Banco</Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 7,
              paddingVertical: 1,
              paddingHorizontal: 7,
            }}
          >
            <Text style={{ fontFamily: fonts.mono700, fontSize: 12, color: colors.textMuted }}>
              {players.length}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: fonts.ui500, fontSize: 11, color: colors.textFaint }}>{hint}</Text>
          {onQuickAdd && (
            <Pressable
              onPress={onQuickAdd}
              hitSlop={8}
              accessibilityLabel="Adicionar jogador"
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                backgroundColor: colors.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="plus" size={18} color={colors.primary} />
            </Pressable>
          )}
        </View>
      </View>

      {players.length === 0 ? (
        <Text
          style={{ fontFamily: fonts.ui400, fontSize: 13, color: colors.textFaint, paddingHorizontal: 16, paddingVertical: 6 }}
        >
          Todos os jogadores estão nas mesas 🎉
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 2 }}
        >
          {players.map((p) => (
            <BenchChip
              key={p.id}
              player={p}
              mode={mode}
              selected={selectedId === p.id}
              dragging={draggingId === p.id}
              onTapChip={onTapChip}
              ghostX={ghostX}
              ghostY={ghostY}
              {...drag}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

interface BenchChipProps extends DragCallbacks {
  player: Player;
  mode: MoveMode;
  selected: boolean;
  dragging: boolean;
  onTapChip: (player: Player) => void;
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
}

function BenchChip({
  player,
  mode,
  selected,
  dragging,
  onTapChip,
  ghostX,
  ghostY,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragClear,
}: BenchChipProps) {
  const { colors, fonts } = useTheme();

  const pan = Gesture.Pan()
    .enabled(mode !== 'tap')
    .activeOffsetX([-8, 8])
    .activeOffsetY([-8, 8])
    .onBegin((e) => {
      ghostX.value = e.absoluteX;
      ghostY.value = e.absoluteY;
    })
    .onStart(() => {
      runOnJS(onDragStart)(player);
    })
    .onUpdate((e) => {
      ghostX.value = e.absoluteX;
      ghostY.value = e.absoluteY;
      runOnJS(onDragMove)(e.absoluteX, e.absoluteY);
    })
    .onEnd((e) => {
      runOnJS(onDragEnd)(e.absoluteX, e.absoluteY);
    })
    .onFinalize(() => {
      runOnJS(onDragClear)();
    });

  const tap = Gesture.Tap()
    .enabled(mode !== 'drag')
    .maxDistance(10)
    .onEnd((_e, success) => {
      if (success) runOnJS(onTapChip)(player);
    });

  const gesture = mode === 'drag' ? pan : mode === 'tap' ? tap : Gesture.Race(pan, tap);

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: selected ? colors.primary : colors.surfaceMuted,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: 999,
          paddingVertical: 5,
          paddingLeft: 5,
          paddingRight: 12,
          opacity: dragging ? 0.35 : 1,
        }}
      >
        <Avatar player={player} size={28} />
        <View>
          <Text style={{ fontFamily: fonts.ui600, fontSize: 13, color: selected ? '#fff' : colors.text }}>
            {firstName(player.name)}
          </Text>
          <Text
            style={{ fontFamily: fonts.ui500, fontSize: 9.5, color: selected ? 'rgba(255,255,255,0.8)' : colors.textMuted }}
          >
            {player.level}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}
