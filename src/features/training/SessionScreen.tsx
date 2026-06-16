import { useRouter } from 'expo-router';
import { type ComponentRef, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, BottomSheet, Button } from '@/components';
import { PlayerSheet } from '@/features/players/PlayerSheet';
import { Icon } from '@/icons';
import type { Court, Player, TableModel, TableSide } from '@/models/types';
import { getActiveSession, sessionRosterPresent } from '@/store/selectors';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme';

import { Bench } from './Bench';
import { ManageTableSheet } from './ManageTableSheet';
import { NoShowBar } from './NoShowBar';
import { PlayerPickerSheet } from './PlayerPickerSheet';
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

/** Players seated across the given court's tables. */
const courtSeatedCount = (court: Court, assignments: Record<string, { coach: string[]; players: string[] }>) =>
  court.tables.reduce((n, t) => {
    const a = assignments[t.id];
    return n + (a ? a.coach.length + a.players.length : 0);
  }, 0);

export function SessionScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const courts = useStore((s) => s.courts);
  const gyms = useStore((s) => s.gyms);
  const players = useStore((s) => s.players);
  const assignments = useStore((s) => s.assignments);
  const tableFormats = useStore((s) => s.tableFormats);
  const tableTypes = useStore((s) => s.tableTypes);
  const session = useStore(getActiveSession);
  const activeCourtId = useStore((s) => s.activeCourtId);
  const setActiveCourtId = useStore((s) => s.setActiveCourtId);
  const moveMode = useStore((s) => s.settings.moveMode);
  const layout = useStore((s) => s.settings.trainingLayout);
  const placePlayer = useStore((s) => s.placePlayer);
  const removePlayer = useStore((s) => s.removePlayer);
  const clearCourtTables = useStore((s) => s.clearCourtTables);
  const setTableFormat = useStore((s) => s.setTableFormat);
  const setTableType = useStore((s) => s.setTableType);
  const renameTable = useStore((s) => s.renameTable);
  const finishSession = useStore((s) => s.finishSession);
  const cancelSession = useStore((s) => s.cancelSession);
  const addToRoster = useStore((s) => s.addToRoster);
  const markNoShow = useStore((s) => s.markNoShow);
  const unmarkNoShow = useStore((s) => s.unmarkNoShow);
  const addPlayer = useStore((s) => s.addPlayer);

  const gym = gyms.find((g) => g.id === session?.gymId) ?? null;
  const gymCourts = useMemo(
    () => (session ? courts.filter((c) => c.gymId === session.gymId) : []),
    [courts, session],
  );
  // The court currently on screen — driven by activeCourtId, scoped to the gym.
  const viewedCourt = gymCourts.find((c) => c.id === activeCourtId) ?? gymCourts[0] ?? null;

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const resolve = (ids: string[]): Player[] =>
    ids.map((id) => byId.get(id)).filter((p): p is Player => Boolean(p));

  const presentPlayers = resolve(sessionRosterPresent(session));
  const noShowPlayers = resolve(session?.noShowIds ?? []);
  const candidatesToAdd = players.filter((p) => !(session?.rosterIds ?? []).includes(p.id));

  // Players seated on ANY court of the gym (courts are shared in a session).
  const seatedAnywhere = useMemo(() => {
    const set = new Set<string>();
    gymCourts.forEach((c) =>
      c.tables.forEach((t) => {
        const a = assignments[t.id];
        if (a) {
          a.coach.forEach((id) => set.add(id));
          a.players.forEach((id) => set.add(id));
        }
      }),
    );
    return set;
  }, [gymCourts, assignments]);

  const bench = presentPlayers.filter((p) => !seatedAnywhere.has(p.id));
  const placed = presentPlayers.length - bench.length;
  const viewedPlaced = viewedCourt ? courtSeatedCount(viewedCourt, assignments) : 0;

  // ── interaction state ──────────────────────────────────
  const [selBench, setSelBench] = useState<string | null>(null);
  const [sheetTable, setSheetTable] = useState<TableModel | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [creating, setCreating] = useState(false);
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
    transform: [{ translateX: ghostX.value - 23 }, { translateY: ghostY.value - 66 }],
  }));
  const ghostPlayer = draggingId ? byId.get(draggingId) : null;

  const cols = layout === 'list' ? 1 : (viewedCourt?.cols ?? 2);
  const selectedPlayer = selBench ? byId.get(selBench) : null;
  const liveSheetTable = sheetTable
    ? (viewedCourt?.tables.find((t) => t.id === sheetTable.id) ?? sheetTable)
    : null;

  // Keep activeCourtId pointing at a valid court of the gym.
  useEffect(() => {
    if (session && viewedCourt && viewedCourt.id !== activeCourtId) {
      setActiveCourtId(viewedCourt.id);
    }
  }, [session, viewedCourt, activeCourtId, setActiveCourtId]);

  // No active session → the Treino tab renders the lobby instead.
  if (!session) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // Active session but the gym has no courts (all deleted mid-session).
  if (!viewedCourt) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
        <Icon name="court" size={32} color={colors.textFaint} />
        <Text style={{ fontFamily: fonts.ui600, fontSize: 16, color: colors.text, textAlign: 'center' }}>
          {gym?.name ?? 'Ginásio'} não tem quadras
        </Text>
        <Button variant="soft" icon="court" onPress={() => router.navigate('/(tabs)/courts')}>
          Cadastrar quadra
        </Button>
        <Pressable onPress={() => finishSession()} style={{ padding: 8 }}>
          <Text style={{ fontFamily: fonts.ui600, fontSize: 14, color: colors.danger }}>
            Finalizar treino
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              {gym && (
                <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: gym.color }} />
              )}
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
            <Text style={{ fontFamily: fonts.display600, fontSize: 21, color: colors.text }}>
              {viewedCourt.name}
            </Text>
          </View>
          <Button variant="soft" size="sm" icon="check" onPress={() => setConfirmFinish(true)}>
            Finalizar
          </Button>
        </View>

        <TimerBar />

        {/* counts + clear */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            paddingHorizontal: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Icon name="players" size={18} color={colors.textMuted} />
            <Text style={{ fontFamily: fonts.mono700, fontSize: 15, color: colors.textMuted }}>
              {placed}
              <Text style={{ color: colors.textFaint }}>/{presentPlayers.length} em jogo</Text>
            </Text>
          </View>
          {viewedPlaced > 0 && (
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
        </View>

        {/* court switcher — only when the gym has more than one court */}
        {gymCourts.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingTop: 10, paddingBottom: 2 }}
            style={{ marginHorizontal: -2 }}
          >
            {gymCourts.map((c) => (
              <CourtChip
                key={c.id}
                name={c.name}
                seated={courtSeatedCount(c, assignments)}
                active={c.id === viewedCourt.id}
                onPress={() => setActiveCourtId(c.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* canvas */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 12 }}>
          {chunk(viewedCourt.tables, cols).map((row, ri) => (
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
                      type={tableTypes[t.id]}
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

      {/* no-show strip */}
      <NoShowBar
        players={noShowPlayers}
        onAdd={() => setNoShowOpen(true)}
        onRemove={(id) => unmarkNoShow(id)}
      />

      {/* bench */}
      <Bench
        players={bench}
        mode={moveMode}
        selectedId={selBench}
        draggingId={draggingId}
        onTapChip={onTapChip}
        onQuickAdd={() => setAddOpen(true)}
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
      <BottomSheet open={confirmClear} onClose={() => setConfirmClear(false)} title={`Esvaziar ${viewedCourt.name}?`}>
        <Text style={{ fontFamily: fonts.ui400, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 18 }}>
          Os {viewedPlaced} jogadores em {viewedCourt.name} voltarão para o banco. Os formatos e nomes das mesas são mantidos.
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
              clearCourtTables(viewedCourt.id);
              setConfirmClear(false);
            }}
          >
            Esvaziar
          </Button>
        </View>
      </BottomSheet>

      {/* confirm finish */}
      <BottomSheet open={confirmFinish} onClose={() => setConfirmFinish(false)} title="Finalizar treino?">
        <Text style={{ fontFamily: fonts.ui400, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 18 }}>
          {presentPlayers.length} {presentPlayers.length === 1 ? 'presença' : 'presenças'}
          {noShowPlayers.length > 0
            ? ` e ${noShowPlayers.length} ${noShowPlayers.length === 1 ? 'falta' : 'faltas'}`
            : ''}{' '}
          serão registrados no histórico.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button variant="ghost" full style={{ flex: 1 }} onPress={() => setConfirmFinish(false)}>
            Cancelar
          </Button>
          <Button
            icon="check"
            full
            style={{ flex: 1 }}
            onPress={() => {
              setConfirmFinish(false);
              finishSession();
            }}
          >
            Finalizar
          </Button>
        </View>
        <Pressable
          onPress={() => {
            setConfirmFinish(false);
            cancelSession();
          }}
          style={{ alignSelf: 'center', padding: 10, marginTop: 6 }}
        >
          <Text style={{ color: colors.danger, fontFamily: fonts.ui600, fontSize: 13.5 }}>
            Descartar treino
          </Text>
        </Pressable>
      </BottomSheet>

      {/* quick-add to roster */}
      <PlayerPickerSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Adicionar jogador"
        players={candidatesToAdd}
        emptyText="Todos os jogadores já estão no treino."
        search
        onPick={(id) => addToRoster(id)}
        onCreateNew={() => {
          setAddOpen(false);
          setCreating(true);
        }}
      />

      {/* mark no-show */}
      <PlayerPickerSheet
        open={noShowOpen}
        onClose={() => setNoShowOpen(false)}
        title="Quem não veio?"
        players={presentPlayers}
        emptyText="Ninguém disponível para marcar falta."
        onPick={(id) => markNoShow(id)}
        actionIcon="userMinus"
        actionTone="danger"
      />

      {/* create a brand-new player, then add to roster */}
      <PlayerSheet
        editing={creating ? 'new' : null}
        gyms={gyms}
        onClose={() => setCreating(false)}
        onSave={(draft) => {
          const id = addPlayer(draft);
          addToRoster(id);
          setCreating(false);
        }}
        onDelete={() => setCreating(false)}
      />

      {/* manage table sheet */}
      <ManageTableSheet
        table={liveSheetTable}
        format={sheetTable ? (tableFormats[sheetTable.id] ?? 'training') : 'training'}
        type={sheetTable ? (tableTypes[sheetTable.id] ?? '') : ''}
        coach={sheetTable ? resolve((assignments[sheetTable.id] ?? { coach: [] }).coach ?? []) : []}
        players={sheetTable ? resolve((assignments[sheetTable.id] ?? { players: [] }).players ?? []) : []}
        bench={bench}
        onClose={() => setSheetTable(null)}
        onSetFormat={(format) => sheetTable && setTableFormat(sheetTable.id, format)}
        onSetType={(type) => sheetTable && setTableType(sheetTable.id, type)}
        onRemove={(playerId) => removePlayer(playerId)}
        onAdd={(playerId, side) => sheetTable && placePlayer(playerId, sheetTable.id, side)}
        onRename={(label) => sheetTable && renameTable(sheetTable.id, label)}
      />
    </View>
  );
}

/** Pill in the court switcher showing the court name + seated count. */
function CourtChip({
  name,
  seated,
  active,
  onPress,
}: {
  name: string;
  seated: number;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: active ? colors.primary : colors.surfaceMuted,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 13,
      }}
    >
      <Icon name="court" size={14} color={active ? '#fff' : colors.textMuted} />
      <Text style={{ fontFamily: fonts.ui600, fontSize: 13, color: active ? '#fff' : colors.text }}>
        {name}
      </Text>
      <View
        style={{
          minWidth: 18,
          height: 18,
          paddingHorizontal: 5,
          borderRadius: 9,
          backgroundColor: active ? 'rgba(255,255,255,0.22)' : colors.surface,
          borderWidth: active ? 0 : 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: fonts.mono700, fontSize: 11, color: active ? '#fff' : colors.textMuted }}>
          {seated}
        </Text>
      </View>
    </Pressable>
  );
}

/** Split tables into rows of `size` for the grid. */
function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}
