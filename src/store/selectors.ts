/** Pure derived-state helpers over the store (kept out of components). */
import type { Assignments, Court, Gym, Player, TrainingSession } from '@/models/types';
import { parseISODate } from '@/utils/date';

import type { AppState } from './useStore';

export const getActiveCourt = (s: AppState): Court | null =>
  s.courts.find((c) => c.id === s.activeCourtId) ?? null;

export const getActiveGym = (s: AppState): Gym | null => {
  const court = getActiveCourt(s);
  return s.gyms.find((g) => g.id === court?.gymId) ?? null;
};

export const gymPlayers = (players: Player[], gymId: string | null | undefined): Player[] =>
  gymId ? players.filter((p) => p.gymIds.includes(gymId)) : [];

export const gymCourts = (courts: Court[], gymId: string | null | undefined): Court[] =>
  gymId ? courts.filter((c) => c.gymId === gymId) : [];

/** All player ids currently seated anywhere (both sides). */
export const assignedIdSet = (assignments: Assignments): Set<string> => {
  const set = new Set<string>();
  for (const a of Object.values(assignments)) {
    a.coach.forEach((id) => set.add(id));
    a.players.forEach((id) => set.add(id));
  }
  return set;
};

/** Number of players seated across the given court's tables. */
export const placedCountForCourt = (court: Court | null, assignments: Assignments): number => {
  if (!court) return 0;
  return court.tables.reduce((n, t) => {
    const a = assignments[t.id];
    return n + (a ? a.coach.length + a.players.length : 0);
  }, 0);
};

// ── Training sessions (Treinos) ──────────────────────────

/** The currently active session, or null. */
export const getActiveSession = (s: AppState): TrainingSession | null =>
  s.sessions.find((ses) => ses.id === s.activeSessionId) ?? null;

/** Roster ids that are present (roster minus no-shows). */
export const sessionRosterPresent = (session: TrainingSession | null): string[] =>
  session ? session.rosterIds.filter((id) => !session.noShowIds.includes(id)) : [];

/** Finished sessions, most recent first (by finishedAt, then startedAt). */
export const finishedSessions = (sessions: TrainingSession[]): TrainingSession[] =>
  sessions
    .filter((s) => s.status === 'finished')
    .sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt));

export interface AttendanceEntry {
  sessionId: string;
  /** 'YYYY-MM-DD' */
  date: string;
  status: 'present' | 'absent';
  sessionStartTime: string;
  sessionEndTime: string;
}

/** A player's attendance across finished sessions where they were in the roster. */
export const playerAttendance = (
  sessions: TrainingSession[],
  playerId: string,
): AttendanceEntry[] =>
  sessions
    .filter((s) => s.status === 'finished' && s.rosterIds.includes(playerId))
    .map((s) => ({
      sessionId: s.id,
      date: s.date,
      status: s.noShowIds.includes(playerId) ? ('absent' as const) : ('present' as const),
      sessionStartTime: s.startTime,
      sessionEndTime: s.endTime,
    }));

export interface MonthAttendance {
  /** day-of-month (1..31) -> attendance counts for that day. */
  byDay: Map<number, { present: number; absent: number }>;
  totalPresent: number;
  totalAbsent: number;
}

/** Aggregate a player's attendance for a given year + 0-based month. */
export const monthAttendance = (
  sessions: TrainingSession[],
  playerId: string,
  year: number,
  month: number,
): MonthAttendance => {
  const byDay = new Map<number, { present: number; absent: number }>();
  let totalPresent = 0;
  let totalAbsent = 0;
  for (const entry of playerAttendance(sessions, playerId)) {
    const d = parseISODate(entry.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const day = d.getDate();
    const cur = byDay.get(day) ?? { present: 0, absent: 0 };
    if (entry.status === 'present') {
      cur.present += 1;
      totalPresent += 1;
    } else {
      cur.absent += 1;
      totalAbsent += 1;
    }
    byDay.set(day, cur);
  }
  return { byDay, totalPresent, totalAbsent };
};
