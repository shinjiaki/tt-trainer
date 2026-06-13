/**
 * Global app state (§3.8) — Zustand store with AsyncStorage persistence (§7).
 * Holds entities (gyms/courts/players), session state (active court, selected
 * gym, assignments, table formats), the training timer and settings, plus all
 * mutating actions. Business rules from §6 live here.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  Assignments,
  Court,
  Gym,
  Player,
  Settings,
  TableFormat,
  TableFormats,
  TableModel,
  TableSide,
  TimerState,
} from '@/models/types';
import { uid } from '@/utils/text';

import {
  DEFAULT_SETTINGS,
  SEED_ASSIGNMENTS,
  SEED_COURTS,
  SEED_GYMS,
  SEED_PLAYERS,
  SEED_TABLE_FORMATS,
} from './seed';

/** Max players per side given the table format (new feature). */
export const coachCapacity = (format: TableFormat): number => (format === 'doubles' ? 2 : 1);
export const playerCapacity = (format: TableFormat): number =>
  format === 'doubles' ? 2 : Infinity;

const emptyAssignment = () => ({ coach: [] as string[], players: [] as string[] });

const generateTables = (count: number, cols: number): TableModel[] =>
  Array.from({ length: count }, (_, i) => ({
    id: uid('tbl'),
    label: `Mesa ${i + 1}`,
    gx: i % cols,
    gy: Math.floor(i / cols),
  }));

/** Remove a player from every seat (both sides of every table). */
const withoutPlayer = (assignments: Assignments, playerId: string): Assignments => {
  const next: Assignments = {};
  for (const [tid, a] of Object.entries(assignments)) {
    next[tid] = {
      coach: a.coach.filter((id) => id !== playerId),
      players: a.players.filter((id) => id !== playerId),
    };
  }
  return next;
};

/** Drop assignments/formats for tables that no longer exist. */
const pruneToTables = (
  courts: Court[],
  assignments: Assignments,
  formats: TableFormats,
): { assignments: Assignments; tableFormats: TableFormats } => {
  const valid = new Set(courts.flatMap((c) => c.tables.map((t) => t.id)));
  const nextA: Assignments = {};
  for (const [tid, a] of Object.entries(assignments)) if (valid.has(tid)) nextA[tid] = a;
  const nextF: TableFormats = {};
  for (const [tid, f] of Object.entries(formats)) if (valid.has(tid)) nextF[tid] = f;
  return { assignments: nextA, tableFormats: nextF };
};

export interface AppState {
  // entities
  gyms: Gym[];
  courts: Court[];
  players: Player[];
  // session
  activeCourtId: string | null;
  selectedGymId: string | null;
  assignments: Assignments;
  tableFormats: TableFormats;
  // training timer (not persisted)
  timer: TimerState;
  // preferences
  settings: Settings;

  // ── Gyms ───────────────────────────────────────────────
  addGym: (data: Omit<Gym, 'id'>) => void;
  updateGym: (id: string, data: Partial<Omit<Gym, 'id'>>) => void;
  /** Cascade: removes the gym, its courts, and unlinks it from players (§6.6). */
  deleteGym: (id: string) => void;

  // ── Courts ─────────────────────────────────────────────
  addCourt: (input: { gymId: string; name: string; cols: number; tableCount: number }) => void;
  updateCourt: (id: string, input: { name: string; cols: number; tableCount: number }) => void;
  deleteCourt: (id: string) => void;
  setActiveCourtId: (id: string) => void;
  setSelectedGymId: (id: string) => void;

  // ── Players ────────────────────────────────────────────
  addPlayer: (data: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, data: Partial<Omit<Player, 'id'>>) => void;
  deletePlayer: (id: string) => void;

  // ── Training (assignments) ─────────────────────────────
  /** Place a player on a table side, honoring capacity + the one-seat rule (§6.4). */
  placePlayer: (playerId: string, tableId: string, side: TableSide) => void;
  /** Send a player back to the bench. */
  removePlayer: (playerId: string) => void;
  /** Switch a table between 'training' (1×N) and 'doubles' (2×2). */
  setTableFormat: (tableId: string, format: TableFormat) => void;

  // ── Timer ──────────────────────────────────────────────
  tickTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;

  // ── Settings ───────────────────────────────────────────
  updateSettings: (patch: Partial<Settings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      gyms: SEED_GYMS,
      courts: SEED_COURTS,
      players: SEED_PLAYERS,
      activeCourtId: SEED_COURTS[0]?.id ?? null,
      selectedGymId: SEED_COURTS[0]?.gymId ?? SEED_GYMS[0]?.id ?? null,
      assignments: SEED_ASSIGNMENTS,
      tableFormats: SEED_TABLE_FORMATS,
      timer: { seconds: 0, running: false },
      settings: DEFAULT_SETTINGS,

      addGym: (data) =>
        set((s) => ({
          gyms: [...s.gyms, { id: uid('g'), ...data, name: data.name.trim() || 'Novo ginásio' }],
        })),

      updateGym: (id, data) =>
        set((s) => ({
          gyms: s.gyms.map((g) =>
            g.id === id ? { ...g, ...data, name: (data.name ?? g.name).trim() || g.name } : g,
          ),
        })),

      deleteGym: (id) =>
        set((s) => {
          const courts = s.courts.filter((c) => c.gymId !== id);
          const { assignments, tableFormats } = pruneToTables(courts, s.assignments, s.tableFormats);
          const activeStillExists = courts.some((c) => c.id === s.activeCourtId);
          return {
            gyms: s.gyms.filter((g) => g.id !== id),
            courts,
            players: s.players.map((p) => ({
              ...p,
              gymIds: p.gymIds.filter((x) => x !== id),
            })),
            assignments,
            tableFormats,
            activeCourtId: activeStillExists ? s.activeCourtId : (courts[0]?.id ?? null),
            selectedGymId:
              s.selectedGymId === id
                ? (s.gyms.find((g) => g.id !== id)?.id ?? null)
                : s.selectedGymId,
          };
        }),

      addCourt: ({ gymId, name, cols, tableCount }) =>
        set((s) => {
          const court: Court = {
            id: uid('c'),
            gymId,
            name: name.trim() || 'Nova quadra',
            cols,
            tables: generateTables(tableCount, cols),
          };
          return {
            courts: [...s.courts, court],
            activeCourtId: s.activeCourtId ?? court.id,
          };
        }),

      updateCourt: (id, { name, cols, tableCount }) =>
        set((s) => {
          const courts = s.courts.map((c) =>
            c.id === id
              ? { ...c, name: name.trim() || c.name, cols, tables: generateTables(tableCount, cols) }
              : c,
          );
          const { assignments, tableFormats } = pruneToTables(courts, s.assignments, s.tableFormats);
          return { courts, assignments, tableFormats };
        }),

      deleteCourt: (id) =>
        set((s) => {
          const courts = s.courts.filter((c) => c.id !== id);
          const { assignments, tableFormats } = pruneToTables(courts, s.assignments, s.tableFormats);
          const activeStillExists = courts.some((c) => c.id === s.activeCourtId);
          return {
            courts,
            assignments,
            tableFormats,
            activeCourtId: activeStillExists ? s.activeCourtId : (courts[0]?.id ?? null),
          };
        }),

      setActiveCourtId: (id) => set({ activeCourtId: id }),
      setSelectedGymId: (id) => set({ selectedGymId: id }),

      addPlayer: (data) =>
        set((s) => ({
          players: [
            ...s.players,
            { id: uid('p'), ...data, name: data.name.trim() || 'Novo jogador' },
          ],
        })),

      updatePlayer: (id, data) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, ...data, name: (data.name ?? p.name).trim() || p.name } : p,
          ),
        })),

      deletePlayer: (id) =>
        set((s) => ({
          players: s.players.filter((p) => p.id !== id),
          assignments: withoutPlayer(s.assignments, id),
        })),

      placePlayer: (playerId, tableId, side) =>
        set((s) => {
          const format = s.tableFormats[tableId] ?? 'training';
          const max = side === 'coach' ? coachCapacity(format) : playerCapacity(format);
          const current = s.assignments[tableId] ?? emptyAssignment();
          // Count the target side excluding this player (re-placing on same side is a no-op move).
          const targetCount = current[side].filter((id) => id !== playerId).length;
          if (targetCount >= max) return s; // side full → ignore

          const cleared = withoutPlayer(s.assignments, playerId);
          const slot = cleared[tableId] ?? emptyAssignment();
          cleared[tableId] = { ...slot, [side]: [...slot[side], playerId] };
          return { assignments: cleared };
        }),

      removePlayer: (playerId) =>
        set((s) => ({ assignments: withoutPlayer(s.assignments, playerId) })),

      setTableFormat: (tableId, format) =>
        set((s) => {
          const current = s.assignments[tableId] ?? emptyAssignment();
          const coachMax = coachCapacity(format);
          const playerMax = playerCapacity(format);
          const trimmed = {
            coach: current.coach.slice(0, coachMax),
            players: Number.isFinite(playerMax)
              ? current.players.slice(0, playerMax)
              : current.players,
          };
          return {
            tableFormats: { ...s.tableFormats, [tableId]: format },
            assignments: { ...s.assignments, [tableId]: trimmed },
          };
        }),

      tickTimer: () => set((s) => ({ timer: { ...s.timer, seconds: s.timer.seconds + 1 } })),
      toggleTimer: () => set((s) => ({ timer: { ...s.timer, running: !s.timer.running } })),
      resetTimer: () => set({ timer: { seconds: 0, running: false } }),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: 'tt-trainer-state-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        gyms: s.gyms,
        courts: s.courts,
        players: s.players,
        activeCourtId: s.activeCourtId,
        selectedGymId: s.selectedGymId,
        assignments: s.assignments,
        tableFormats: s.tableFormats,
        settings: s.settings,
      }),
    },
  ),
);
