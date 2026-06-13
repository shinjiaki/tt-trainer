import type { HandName, LevelName, Weekday } from '@/models/types';

export const PLAYER_COLORS = [
  '#1d5fd6',
  '#ff6a2b',
  '#1f9d5b',
  '#8b5cf6',
  '#e0a400',
  '#e64980',
  '#0ea5b7',
  '#f25f3a',
];

export const LEVELS: LevelName[] = ['Iniciante', 'Intermediário', 'Avançado'];
export const HANDS: HandName[] = ['Destro', 'Canhoto'];

/**
 * Days of the week for the Frequência picker, in display order (Seg → Dom).
 * `value` matches JS `Date.getDay()` so it can be compared against real dates.
 */
export const WEEKDAYS: { value: Weekday; short: string; label: string }[] = [
  { value: 0, short: 'Dom', label: 'Domingo' },
  { value: 1, short: 'Seg', label: 'Segunda' },
  { value: 2, short: 'Ter', label: 'Terça' },
  { value: 3, short: 'Qua', label: 'Quarta' },
  { value: 4, short: 'Qui', label: 'Quinta' },
  { value: 5, short: 'Sex', label: 'Sexta' },
  { value: 6, short: 'Sáb', label: 'Sábado' },
];
