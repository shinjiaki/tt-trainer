import { useRouter } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, BottomSheet, Button } from '@/components';
import { Icon } from '@/icons';
import type { Player, TableModel, TableSide } from '@/models/types';
import { assignedIdSet } from '@/store/selectors';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';

import { Bench } from './Bench';
import { ManageTableSheet } from './ManageTableSheet';
import { TableTop } from './TableTop';
import { TimerBar } from './TimerBar';

type ViewRef = ComponentRef<typeof View>;
interface ZoneEntry {
  node: ViewRef;
  tableId: string;
  side: TableSide;
}
interface ZoneRect extends Omit<ZoneEntry, 'node'> {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function TrainingScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const courts = useStore((s) => s.courts);
  const gyms = useStore((s) => s.gyms);
  const players = useStore((s) => s.players);
  const assignments = useStore((s) => s.assignments);
  const tableFormats = useStore((s) => s.tableFormats);
  const activeCourtId = useStore((s) => s.activeCourtId);
  const moveMode = useStore((s) => s.settings.moveMode);
  const layout = useStore((s) => s.settings.trainingLayout);
  const placePlayer = useStore((s) => s.placePlayer);
  const removePlayer = useStore((s) => s.removePlayer);
  const clearCourtTables = useStore((s) => s.clearCourtTables);
  const setTableFormat = useStore((s) => s.setTableFormat);
  const renameTable = useStore((s) => s.renameTable);

  const court = courts.find((c) => c.id === activeCourtId) ?? null;
  const gym = gyms.find((g) => g.id === court?.gymId) ?? null;
  const gymPlayers = useMemo(
    () => (gym ? players.filter((p) => p.gymIds.includes(gym.id)) : []),
    [players, gym],
  );
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const resolve = (ids: string[]): Player[] =>
    ids.map((id) => byId.get(id)).filter((p): p is Player => Boolean(p));

  const assignedSet = assignedIdSet(assignments);
  const bench = gymPlayers.filter((p) => !assignedSet.has(p.id));
  const placed = gymPlayers.filter((p) => assignedSet.has(p.id)).length;

  // ── interaction state ──────────────────────────────────
  const [selBench, setSelBench] = useState<string | null>(null);
  const [sheetTable, setSheetTable] = useState<TableModel | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  // ── drop-zone registry + hit testing ───────────────────
  const zones = useRef<Map<string, ZoneEntry>>(new Map());
  const rects = useRef<ZoneRect[]>([]);

  const registerZone = (key: string, node: ViewRef | null) => {
    if (!node) {
      zones.current.delete(key);
      return;
    }
    const [tableId, side] = key.split(':') as [string, TableSide];
    zones.current.set(key, { node, tableId, side });
  };

  const measureZones = () => {
    rects.current = [];
    zones.current.forEach((entry) => {
      entry.node.measureInWindow((x, y, w, h) => {
        rects.current = [
          ...rects.current.filter((r) => !(r.tableId === entry.tableId && r.side === entry.side)),
          { tableId: entry.tableId, side: entry.side, x, y, w, h },
        ];
      });
    });
  };

  const hitTest = (x: number, y: number): ZoneRect | null =>
    rects.current.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) ?? null;

  // ── drag callbacks (called from gestures via runOnJS) ──
  const onDragStart = (player: Player) => {
    draggingIdRef.current = player.id;
    setDraggingId(player.id);
    setSelBench(null);
    measureZones();
  };
  const onDragMove = (x: number, y: number) => {
    const hit = hitTest(x, y);
    setDragOverKey(hit ? `${hit.tableId}:${hit.side}` : null);
  };
  const onDragEnd = (x: number, y: number) => {
    const hit = hitTest(x, y);
    const playerId = draggingIdRef.current;
    if (hit && playerId) placePlayer(playerId, hit.tableId, hit.side);
  };
  const onDragClear = () => {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDragOverKey(null);
  };

  // ── tap interactions ───────────────────────────────────
  const onPressSide = (table: TableModel, side: TableSide) => {
    if (selBench) {
      placePlayer(selBench, table.id, side);
      setSelBench(null);
      return;
    }
    setSheetTable(table);
  };
  const onTapChip = (player: Player) =>
    setSelBench((cur) => (cur === player.id ? null : player.id));

  // ── ghost ──────────────────────────────────────────────
  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostStyle = useAnimatedStyle(() => ({
    // Lift the avatar above the fingertip so the dragged name isn't hidden by the finger.
    transform: [{ translateX: ghostX.value - 23 }, { translateY: ghostY.value - 66 }],
  }));
  const ghostPlayer = draggingId ? byId.get(draggingId) : null;

  const cols = layout === 'list' ? 1 : (court?.cols ?? 2);
  const selectedPlayer = selBench ? byId.get(selBench) : null;
  // Use the live table from the store so a rename reflects immediately in the open sheet.
  const liveSheetTable = sheetTable
    ? (court?.tables.find((t) => t.id === sheetTable.id) ?? sheetTable)
    : null;

  if (!court) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <Icon name="court" size={32} color={colors.textFaint} />
        <Text style={{ fontFamily: fonts.ui600, fontSize: 16, color: colors.text }}>
          Nenhuma quadra ativa
        </Text>
        <Pressable onPress={() => router.navigate('/(tabs)/courts')}>
          <Text style={{ fontFamily: fonts.ui600, fontSize: 14, color: colors.primary }}>
            Escolher quadra
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              {gym && <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: gym.color }} />}
              <Text
                style={{
                  fontFamily: fonts.ui700,
                  fontSize: 11,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: colors.textFaint,
                }}
              >
                {gym?.name ?? 'Treino'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.navigate('/(tabs)/courts')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Text style={{ fontFamily: fonts.display600, fontSize: 22, color: colors.text }}>
                {court.name}
              </Text>
              <Icon name="chevron" size={17} color={colors.textFaint} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {placed > 0 && (
              <Pressable
                onPress={() => setConfirmClear(true)}
                hitSlop={8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              >
                <Icon name="bench" size={18} color={colors.textMuted} />
                <Text style={{ fontFamily: fonts.ui600, fontSize: 13, color: colors.textMuted }}>
                  Esvaziar
                </Text>
              </Pressable>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Icon name="players" size={18} color={colors.textMuted} />
              <Text style={{ fontFamily: fonts.mono700, fontSize: 15, color: colors.textMuted }}>
                {placed}
                <Text style={{ color: colors.textFaint }}>/{gymPlayers.length}</Text>
              </Text>
            </View>
          </View>
        </View>
        <TimerBar />
      </View>

      {/* canvas */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 12 }}>
          {chunk(court.tables, cols).map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', gap: 12 }}>
              {row.map((t) => {
                const a = assignments[t.id] ?? { coach: [], players: [] };
                const format = tableFormats[t.id] ?? 'training';
                const dragOverSide: TableSide | null =
                  dragOverKey === `${t.id}:coach`
                    ? 'coach'
                    : dragOverKey === `${t.id}:players`
                      ? 'players'
                      : null;
                return (
                  <View key={t.id} style={{ flex: 1 }}>
                    <TableTop
                      table={t}
                      format={format}
                      coach={resolve(a.coach)}
                      players={resolve(a.players)}
                      dragOverSide={dragOverSide}
                      listMode={layout === 'list'}
                      onPressSide={onPressSide}
                      registerZone={registerZone}
                    />
                  </View>
                );
              })}
              {/* keep last partial row aligned */}
              {row.length < cols &&
                Array.from({ length: cols - row.length }).map((_, i) => (
                  <View key={`spacer-${i}`} style={{ flex: 1 }} />
                ))}
            </View>
          ))}
        </View>

        {selectedPlayer && (
          <Text style={{ textAlign: 'center', fontFamily: fonts.ui600, fontSize: 13, color: colors.primary, marginTop: 4 }}>
            Toque em um lado da mesa para colocar {selectedPlayer.name.split(' ')[0]} ·{' '}
            <Text onPress={() => setSelBench(null)} style={{ textDecorationLine: 'underline' }}>
              cancelar
            </Text>
          </Text>
        )}
      </ScrollView>

      {/* bench */}
      <Bench
        players={bench}
        mode={moveMode}
        selectedId={selBench}
        draggingId={draggingId}
        onTapChip={onTapChip}
        ghostX={ghostX}
        ghostY={ghostY}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragClear={onDragClear}
      />

      {/* drag ghost */}
      {ghostPlayer && (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 0, left: 0, zIndex: 999 }, ghostStyle]}
        >
          <Avatar player={ghostPlayer} size={46} />
        </Animated.View>
      )}

      {/* confirm clear tables */}
      <BottomSheet open={confirmClear} onClose={() => setConfirmClear(false)} title="Esvaziar mesas?">
        <Text style={{ fontFamily: fonts.ui400, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 18 }}>
          Todos os {placed} jogadores em mesa voltarão para o banco. Os formatos e nomes das mesas são mantidos.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button variant="ghost" full style={{ flex: 1 }} onPress={() => setConfirmClear(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            icon="bench"
            full
            style={{ flex: 1 }}
            onPress={() => {
              clearCourtTables(court.id);
              setConfirmClear(false);
            }}
          >
            Esvaziar
          </Button>
        </View>
      </BottomSheet>

      {/* manage table sheet */}
      <ManageTableSheet
        table={liveSheetTable}
        format={sheetTable ? (tableFormats[sheetTable.id] ?? 'training') : 'training'}
        coach={sheetTable ? resolve((assignments[sheetTable.id] ?? { coach: [] }).coach ?? []) : []}
        players={sheetTable ? resolve((assignments[sheetTable.id] ?? { players: [] }).players ?? []) : []}
        bench={bench}
        onClose={() => setSheetTable(null)}
        onSetFormat={(format) => sheetTable && setTableFormat(sheetTable.id, format)}
        onRemove={(playerId) => removePlayer(playerId)}
        onAdd={(playerId, side) => sheetTable && placePlayer(playerId, sheetTable.id, side)}
        onRename={(label) => sheetTable && renameTable(sheetTable.id, label)}
      />
    </View>
  );
}

/** Split tables into rows of `size` for the grid. */
function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}
