/**
 * Sample seed data for first launch (§7). Transcribed from claude_design/data.js
 * and adapted to the two-sided assignment model (coach / players).
 */
import type { Assignments, Court, Gym, Player, Settings, TableFormats } from '@/models/types';

export const SEED_GYMS: Gym[] = [
  { id: 'g1', name: 'Arena Pinheiros', city: 'São Paulo · SP', color: '#1d5fd6' },
  { id: 'g2', name: 'Clube Vila Nova', city: 'Campinas · SP', color: '#1f9d5b' },
];

export const SEED_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Lucas Andrade',
    level: 'Avançado',
    hand: 'Destro',
    color: '#1d5fd6',
    gymIds: ['g1'],
  },
  {
    id: 'p2',
    name: 'Marina Costa',
    level: 'Intermediário',
    hand: 'Canhoto',
    color: '#ff6a2b',
    gymIds: ['g1', 'g2'],
  },
  {
    id: 'p3',
    name: 'Pedro Henrique',
    level: 'Iniciante',
    hand: 'Destro',
    color: '#1f9d5b',
    gymIds: ['g1'],
  },
  {
    id: 'p4',
    name: 'Júlia Ramos',
    level: 'Avançado',
    hand: 'Destro',
    color: '#8b5cf6',
    gymIds: ['g2'],
  },
  {
    id: 'p5',
    name: 'Rafael Lima',
    level: 'Intermediário',
    hand: 'Destro',
    color: '#e0a400',
    gymIds: ['g1'],
  },
  {
    id: 'p6',
    name: 'Beatriz Souza',
    level: 'Iniciante',
    hand: 'Canhoto',
    color: '#e64980',
    gymIds: ['g1', 'g2'],
  },
  {
    id: 'p7',
    name: 'Gustavo Reis',
    level: 'Intermediário',
    hand: 'Destro',
    color: '#0ea5b7',
    gymIds: ['g2'],
  },
  {
    id: 'p8',
    name: 'Camila Nunes',
    level: 'Avançado',
    hand: 'Canhoto',
    color: '#f25f3a',
    gymIds: ['g1'],
  },
  {
    id: 'p9',
    name: 'Thiago Melo',
    level: 'Iniciante',
    hand: 'Destro',
    color: '#7c8b3a',
    gymIds: ['g2'],
  },
  {
    id: 'p10',
    name: 'Aline Pires',
    level: 'Intermediário',
    hand: 'Destro',
    color: '#5b6cff',
    gymIds: ['g1', 'g2'],
  },
];

export const SEED_COURTS: Court[] = [
  {
    id: 'c1',
    gymId: 'g1',
    name: 'Quadra Principal',
    cols: 2,
    tables: [
      { id: 't1', label: 'Mesa 1', gx: 0, gy: 0 },
      { id: 't2', label: 'Mesa 2', gx: 1, gy: 0 },
      { id: 't3', label: 'Mesa 3', gx: 0, gy: 1 },
      { id: 't4', label: 'Mesa 4', gx: 1, gy: 1 },
    ],
  },
  {
    id: 'c2',
    gymId: 'g1',
    name: 'Sala B',
    cols: 1,
    tables: [
      { id: 't5', label: 'Mesa 5', gx: 0, gy: 0 },
      { id: 't6', label: 'Mesa 6', gx: 0, gy: 1 },
      { id: 't7', label: 'Mesa 7', gx: 0, gy: 2 },
      { id: 't8', label: 'Mesa 8', gx: 0, gy: 2 },
    ],
  },
];

/** Initial assignments — showcases a coach-side player and a doubles table. */
// All seeded players belong to gym g1 (the active court c1's gym).
export const SEED_ASSIGNMENTS: Assignments = {
  t1: { coach: [], players: ['p1'] },
  t2: { coach: ['p2'], players: ['p3', 'p8'] }, // doubles (2 × 2): coach-side player + two players
  t3: { coach: [], players: ['p5'] },
};

export const SEED_TABLE_FORMATS: TableFormats = {
  t2: 'doubles',
};

export const DEFAULT_SETTINGS: Settings = {
  trainerName: 'Thon',
  defaultGameMinutes: 8,
  rotationAlert: true,
  keepScreenAwake: true,
  soundVibration: true,
  language: 'pt-BR',
  theme: 'azul',
  accent: ['#ff6a2b', '#ffe9dd'],
  moveMode: 'both',
  trainingLayout: 'topdown',
};
