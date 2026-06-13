/** Pure derived-state helpers over the store (kept out of components). */
import type { Assignments, Court, Gym, Player } from '@/models/types';

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
