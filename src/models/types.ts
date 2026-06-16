/**
 * Domain entities for the TT Trainer app.
 * Mirrors §3 (Modelo de dados) of claude_design/ESPECIFICACAO.md.
 */

export type LevelName = 'Iniciante' | 'Intermediário' | 'Avançado';
export type HandName = 'Destro' | 'Canhoto';

/** Day of the week, matching JS `Date.getDay()` — 0 = Domingo … 6 = Sábado. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** §3.1 Gym — a training venue. A trainer has N gyms. */
export interface Gym {
  id: string;
  name: string;
  /** "Cidade · UF", optional. */
  city?: string;
  /** Identifying color (hex). */
  color: string;
}

/** §3.3 Table — a table inside a court, placed on a grid. */
export interface TableModel {
  id: string;
  label: string;
  /** grid position (column, row). */
  gx: number;
  gy: number;
}

/** §3.2 Court — a room with tables; belongs to one gym. */
export interface Court {
  id: string;
  gymId: string;
  name: string;
  /** 1–3 columns layout. */
  cols: number;
  tables: TableModel[];
}

/** §3.4 Player — belongs to N gyms (N:N via gymIds). */
export interface Player {
  id: string;
  name: string;
  level: LevelName;
  hand: HandName;
  color: string;
  gymIds: string[];
  /** Days the player trains (Frequência). Empty = unspecified. */
  weekdays: Weekday[];
}

/**
 * A table has two sides. Originally only the player side held people; the
 * trainer side was fixed. The new feature lets players sit on the coach side
 * too (since the players are themselves the coaches).
 */
export type TableSide = 'coach' | 'players';

/**
 * Table format (new feature):
 * - 'training' → 1 on coach side, N on player side (the default).
 * - 'doubles'  → 2 on coach side, 2 on player side (jogo de duplas).
 */
export type TableFormat = 'training' | 'doubles';

/** §3.5 Per-table assignment: which players sit on each side. */
export interface TableAssignment {
  coach: string[];
  players: string[];
}

/** Map tableId -> assignment. */
export type Assignments = Record<string, TableAssignment>;

/** Map tableId -> chosen format (defaults to 'training' when absent). */
export type TableFormats = Record<string, TableFormat>;

/**
 * Map tableId -> free-text training type (e.g. "forehand", "backhand", "drive").
 * Optional per table; absent or empty string means no tag is shown.
 */
export type TableTypes = Record<string, string>;

export type ThemeName = 'azul' | 'escuro' | 'verde';
/** [accent, accentSoft] override pair. */
export type AccentPair = readonly [string, string];

/** How players are moved on the Training screen. */
export type MoveMode = 'drag' | 'tap' | 'both';
/** Training canvas layout. */
export type TrainingLayout = 'topdown' | 'list';

/** §3.7 Settings + appearance + trainer profile. */
export interface Settings {
  trainerName: string;
  defaultGameMinutes: number;
  rotationAlert: boolean;
  keepScreenAwake: boolean;
  soundVibration: boolean;
  language: string;
  // Appearance (§5.6 → Aparência)
  theme: ThemeName;
  accent: AccentPair;
  // Training preferences (§5.5)
  moveMode: MoveMode;
  trainingLayout: TrainingLayout;
}

/**
 * §3.6 General training timer. Two modes:
 *  - `stopwatch`: counts up from 0 (default / "clear").
 *  - `countdown`: counts down from `durationSeconds`; `finished` flips true at 0.
 */
export interface TimerState {
  mode: 'stopwatch' | 'countdown';
  /** Stopwatch: elapsed. Countdown: remaining. */
  seconds: number;
  /** Selected countdown total in seconds (only meaningful in `countdown` mode). */
  durationSeconds: number;
  running: boolean;
  /** True once a countdown has reached 0 (drives the "time's up" animation). */
  finished: boolean;
}

/** Lifecycle of a training session (Treino). */
export type SessionStatus = 'active' | 'finished';

/**
 * §3.8 Training session (Treino) — a dated class with a chosen roster.
 * Started from the setup screen, run live, then finalized into history.
 * A session is bound to a gym, NOT a court: it can span several courts of the
 * gym at once, and the coach switches the viewed court freely during training.
 * Attendance (presença) is derived from finished sessions:
 *   present = rosterIds − noShowIds · absent = noShowIds.
 */
export interface TrainingSession {
  id: string;
  gymId: string;
  /** Local day of the training, 'YYYY-MM-DD'. */
  date: string;
  /** Planned start/end, 'HH:MM'. */
  startTime: string;
  endTime: string;
  /** Players selected for the session. */
  rosterIds: string[];
  /** Players marked "Não veio" (absent) — always a subset of rosterIds. */
  noShowIds: string[];
  status: SessionStatus;
  /** epoch ms when started. */
  startedAt: number;
  /** epoch ms when finalized (absent while active). */
  finishedAt?: number;
}
