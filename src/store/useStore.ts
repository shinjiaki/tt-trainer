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
  TableTypes,
  TimerState,
  TrainingSession,
} from '@/models/types';
import { uid } from '@/utils/text';

import {
  DEFAULT_SETTINGS,
  SEED_ASSIGNMENTS,
  SEED_COURTS,
  SEED_GYMS,
  SEED_PLAYERS,
  SEED_TABLE_FORMATS,
  SEED_TABLE_TYPES,
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

/** Empty every seat on the tables belonging to the given courts. */
const clearCourtsAssignments = (assignments: Assignments, courts: Court[]): Assignments => {
  const tableIds = new Set(courts.flatMap((c) => c.tables.map((t) => t.id)));
  if (tableIds.size === 0) return assignments;
  const next: Assignments = {};
  for (const [tid, a] of Object.entries(assignments)) {
    next[tid] = tableIds.has(tid) ? emptyAssignment() : a;
  }
  return next;
};

/** Empty every seat across all courts of a gym. */
const clearGymAssignments = (assignments: Assignments, courts: Court[], gymId: string): Assignments =>
  clearCourtsAssignments(
    assignments,
    courts.filter((c) => c.gymId === gymId),
  );

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
  types: TableTypes,
): { assignments: Assignments; tableFormats: TableFormats; tableTypes: TableTypes } => {
  const valid = new Set(courts.flatMap((c) => c.tables.map((t) => t.id)));
  const nextA: Assignments = {};
  for (const [tid, a] of Object.entries(assignments)) if (valid.has(tid)) nextA[tid] = a;
  const nextF: TableFormats = {};
  for (const [tid, f] of Object.entries(formats)) if (valid.has(tid)) nextF[tid] = f;
  const nextT: TableTypes = {};
  for (const [tid, t] of Object.entries(types)) if (valid.has(tid)) nextT[tid] = t;
  return { assignments: nextA, tableFormats: nextF, tableTypes: nextT };
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
  tableTypes: TableTypes;
  // training sessions (Treinos) — history + the one currently active
  sessions: TrainingSession[];
  activeSessionId: string | null;
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
  /** Rename a single table (e.g. "Mesa 1" → "Central"). */
  renameTable: (tableId: string, label: string) => void;
  setActiveCourtId: (id: string) => void;
  setSelectedGymId: (id: string) => void;

  // ── Players ────────────────────────────────────────────
  /** Create a player and return its new id. */
  addPlayer: (data: Omit<Player, 'id'>) => string;
  updatePlayer: (id: string, data: Partial<Omit<Player, 'id'>>) => void;
  deletePlayer: (id: string) => void;

  // ── Training (assignments) ─────────────────────────────
  /** Place a player on a table side, honoring capacity + the one-seat rule (§6.4). */
  placePlayer: (playerId: string, tableId: string, side: TableSide) => void;
  /** Send a player back to the bench. */
  removePlayer: (playerId: string) => void;
  /** Clear every table in a court, sending all assigned players back to the bench. */
  clearCourtTables: (courtId: string) => void;
  /** Switch a table between 'training' (1×N) and 'doubles' (2×2). */
  setTableFormat: (tableId: string, format: TableFormat) => void;
  /** Set the free-text training type tag for a table (empty clears it). */
  setTableType: (tableId: string, type: string) => void;

  // ── Training sessions (Treinos) ────────────────────────
  /**
   * Create + activate a gym-scoped session; clears every court of the gym and
   * sets `initialCourtId` (or the gym's first court) as the viewed court.
   */
  startSession: (input: {
    gymId: string;
    date: string;
    startTime: string;
    endTime: string;
    rosterIds: string[];
    /** Court to view first (not stored on the session). */
    initialCourtId?: string | null;
  }) => void;
  /** Finalize the active session into history. */
  finishSession: () => void;
  /** Discard the active session (not kept in history). */
  cancelSession: () => void;
  /** Quick-add a player to the active session's roster. */
  addToRoster: (playerId: string) => void;
  /** Remove a player from the active session entirely (roster + no-show + seats). */
  removeFromRoster: (playerId: string) => void;
  /** Mark a roster player as "Não veio" (absent), unseating them. */
  markNoShow: (playerId: string) => void;
  /** Undo a no-show, sending the player back to the bench. */
  unmarkNoShow: (playerId: string) => void;
  /** Delete a session from history (or the active one). */
  deleteSession: (id: string) => void;

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
      tableTypes: SEED_TABLE_TYPES,
      sessions: [],
      activeSessionId: null,
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
          const { assignments, tableFormats, tableTypes } = pruneToTables(
            courts,
            s.assignments,
            s.tableFormats,
            s.tableTypes,
          );
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
            tableTypes,
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
          const { assignments, tableFormats, tableTypes } = pruneToTables(
            courts,
            s.assignments,
            s.tableFormats,
            s.tableTypes,
          );
          return { courts, assignments, tableFormats, tableTypes };
        }),

      deleteCourt: (id) =>
        set((s) => {
          const courts = s.courts.filter((c) => c.id !== id);
          const { assignments, tableFormats, tableTypes } = pruneToTables(
            courts,
            s.assignments,
            s.tableFormats,
            s.tableTypes,
          );
          const activeStillExists = courts.some((c) => c.id === s.activeCourtId);
          return {
            courts,
            assignments,
            tableFormats,
            tableTypes,
            activeCourtId: activeStillExists ? s.activeCourtId : (courts[0]?.id ?? null),
          };
        }),

      renameTable: (tableId, label) =>
        set((s) => ({
          courts: s.courts.map((c) =>
            c.tables.some((t) => t.id === tableId)
              ? {
                  ...c,
                  tables: c.tables.map((t) =>
                    t.id === tableId ? { ...t, label: label.trim() || t.label } : t,
                  ),
                }
              : c,
          ),
        })),

      setActiveCourtId: (id) => set({ activeCourtId: id }),
      setSelectedGymId: (id) => set({ selectedGymId: id }),

      addPlayer: (data) => {
        const id = uid('p');
        set((s) => ({
          players: [...s.players, { id, ...data, name: data.name.trim() || 'Novo jogador' }],
        }));
        return id;
      },

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
          sessions: s.sessions.map((ses) => ({
            ...ses,
            rosterIds: ses.rosterIds.filter((pid) => pid !== id),
            noShowIds: ses.noShowIds.filter((pid) => pid !== id),
          })),
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

      clearCourtTables: (courtId) =>
        set((s) => {
          const court = s.courts.find((c) => c.id === courtId);
          if (!court) return s;
          const tableIds = new Set(court.tables.map((t) => t.id));
          const next: Assignments = {};
          for (const [tid, a] of Object.entries(s.assignments)) {
            next[tid] = tableIds.has(tid) ? emptyAssignment() : a;
          }
          return { assignments: next };
        }),

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

      setTableType: (tableId, type) =>
        set((s) => {
          const trimmed = type.trim();
          const next = { ...s.tableTypes };
          if (trimmed) next[tableId] = trimmed;
          else delete next[tableId];
          return { tableTypes: next };
        }),

      // ── Training sessions ──────────────────────────────────
      startSession: ({ gymId, date, startTime, endTime, rosterIds, initialCourtId }) =>
        set((s) => {
          const session: TrainingSession = {
            id: uid('ses'),
            gymId,
            date,
            startTime,
            endTime,
            rosterIds: [...rosterIds],
            noShowIds: [],
            status: 'active',
            startedAt: Date.now(),
          };
          const gymCourts = s.courts.filter((c) => c.gymId === gymId);
          const viewed = gymCourts.find((c) => c.id === initialCourtId)?.id ?? gymCourts[0]?.id ?? null;
          return {
            sessions: [...s.sessions, session],
            activeSessionId: session.id,
            activeCourtId: viewed,
            assignments: clearGymAssignments(s.assignments, s.courts, gymId),
          };
        }),

      finishSession: () =>
        set((s) => {
          if (!s.activeSessionId) return s;
          const active = s.sessions.find((ses) => ses.id === s.activeSessionId);
          return {
            sessions: s.sessions.map((ses) =>
              ses.id === s.activeSessionId
                ? { ...ses, status: 'finished' as const, finishedAt: Date.now() }
                : ses,
            ),
            activeSessionId: null,
            assignments: active
              ? clearGymAssignments(s.assignments, s.courts, active.gymId)
              : s.assignments,
          };
        }),

      cancelSession: () =>
        set((s) => {
          if (!s.activeSessionId) return s;
          const active = s.sessions.find((ses) => ses.id === s.activeSessionId);
          return {
            sessions: s.sessions.filter((ses) => ses.id !== s.activeSessionId),
            activeSessionId: null,
            assignments: active
              ? clearGymAssignments(s.assignments, s.courts, active.gymId)
              : s.assignments,
          };
        }),

      addToRoster: (playerId) =>
        set((s) => {
          if (!s.activeSessionId) return s;
          return {
            sessions: s.sessions.map((ses) =>
              ses.id === s.activeSessionId && !ses.rosterIds.includes(playerId)
                ? { ...ses, rosterIds: [...ses.rosterIds, playerId] }
                : ses,
            ),
          };
        }),

      removeFromRoster: (playerId) =>
        set((s) => {
          if (!s.activeSessionId) return s;
          return {
            sessions: s.sessions.map((ses) =>
              ses.id === s.activeSessionId
                ? {
                    ...ses,
                    rosterIds: ses.rosterIds.filter((id) => id !== playerId),
                    noShowIds: ses.noShowIds.filter((id) => id !== playerId),
                  }
                : ses,
            ),
            assignments: withoutPlayer(s.assignments, playerId),
          };
        }),

      markNoShow: (playerId) =>
        set((s) => {
          if (!s.activeSessionId) return s;
          return {
            sessions: s.sessions.map((ses) => {
              if (ses.id !== s.activeSessionId) return ses;
              const rosterIds = ses.rosterIds.includes(playerId)
                ? ses.rosterIds
                : [...ses.rosterIds, playerId];
              const noShowIds = ses.noShowIds.includes(playerId)
                ? ses.noShowIds
                : [...ses.noShowIds, playerId];
              return { ...ses, rosterIds, noShowIds };
            }),
            assignments: withoutPlayer(s.assignments, playerId),
          };
        }),

      unmarkNoShow: (playerId) =>
        set((s) => {
          if (!s.activeSessionId) return s;
          return {
            sessions: s.sessions.map((ses) =>
              ses.id === s.activeSessionId
                ? { ...ses, noShowIds: ses.noShowIds.filter((id) => id !== playerId) }
                : ses,
            ),
          };
        }),

      deleteSession: (id) =>
        set((s) => ({
          sessions: s.sessions.filter((ses) => ses.id !== id),
          activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
        })),

      tickTimer: () => set((s) => ({ timer: { ...s.timer, seconds: s.timer.seconds + 1 } })),
      toggleTimer: () => set((s) => ({ timer: { ...s.timer, running: !s.timer.running } })),
      resetTimer: () => set({ timer: { seconds: 0, running: false } }),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: 'tt-trainer-state-v1',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      // v2: players gained a `weekdays` field (Frequência). Backfill it as empty.
      // v3: training sessions (Treinos) were added. Backfill empty.
      migrate: (persisted, version) => {
        const state = persisted as Partial<AppState> | undefined;
        if (state?.players && version < 2) {
          state.players = state.players.map((p) => ({ ...p, weekdays: p.weekdays ?? [] }));
        }
        if (state && version < 3) {
          state.sessions = state.sessions ?? [];
          state.activeSessionId = state.activeSessionId ?? null;
        }
        return state as AppState;
      },
      partialize: (s) => ({
        gyms: s.gyms,
        courts: s.courts,
        players: s.players,
        activeCourtId: s.activeCourtId,
        selectedGymId: s.selectedGymId,
        assignments: s.assignments,
        tableFormats: s.tableFormats,
        tableTypes: s.tableTypes,
        sessions: s.sessions,
        activeSessionId: s.activeSessionId,
        settings: s.settings,
      }),
    },
  ),
);
