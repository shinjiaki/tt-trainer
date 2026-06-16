/** Date/time helpers for training sessions (Treinos) and the attendance calendar. */

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Local 'YYYY-MM-DD' for a Date (default: now). */
export const toISODate = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Today as 'YYYY-MM-DD' (local). */
export const todayISO = (): string => toISODate();

/** Parse a local 'YYYY-MM-DD' into a Date at local midnight. */
export const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

/** Current local time as 'HH:MM', minutes rounded down to the step (default 5). */
export const nowHHMM = (step = 5): string => {
  const d = new Date();
  const min = Math.floor(d.getMinutes() / step) * step;
  return `${pad2(d.getHours())}:${pad2(min)}`;
};

/** Add minutes to an 'HH:MM' string, wrapping within a day. */
export const addMinutesHHMM = (hhmm: string, mins: number): string => {
  const [h, m] = hhmm.split(':').map(Number);
  let total = (h * 60 + m + mins) % (24 * 60);
  if (total < 0) total += 24 * 60;
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
};

/** Minutes between two 'HH:MM' (end − start); negative wraps to the next day. */
export const minutesBetween = (start: string, end: string): number => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return diff;
};

/** Human duration like "1h 30min" / "45min" from a minute count. */
export const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}min`;
  if (h) return `${h}h`;
  return `${m}min`;
};

export const MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];
export const MONTHS_LONG = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** 'Qua, 16 jun' for an ISO date. */
export const formatDateLong = (iso: string): string => {
  const d = parseISODate(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

/** 'Junho 2026' for a year and a 0-based month. */
export const formatMonthYear = (year: number, month: number): string =>
  `${MONTHS_LONG[month]} ${year}`;
