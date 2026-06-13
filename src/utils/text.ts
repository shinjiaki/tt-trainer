/** Small pure helpers shared across modules. */

/** Up to 2 uppercase initials from a name ("Lucas Andrade" -> "LA"). */
export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** First word of a name ("Lucas Andrade" -> "Lucas"). */
export const firstName = (name: string): string => name.split(' ')[0] ?? name;

/** Seconds -> "MM:SS" (counts up, tabular). */
export const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** Short unique id with a semantic prefix (e.g. "g_a1b2c3"). */
export const uid = (prefix = 'id'): string => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
