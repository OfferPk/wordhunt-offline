/** Eight placement / selection directions (rowDelta, colDelta). */

export type Direction = { dr: number; dc: number; name: string };

export const DIRECTIONS: readonly Direction[] = [
  { dr: 0, dc: 1, name: 'E' },
  { dr: 0, dc: -1, name: 'W' },
  { dr: 1, dc: 0, name: 'S' },
  { dr: -1, dc: 0, name: 'N' },
  { dr: 1, dc: 1, name: 'SE' },
  { dr: 1, dc: -1, name: 'SW' },
  { dr: -1, dc: 1, name: 'NE' },
  { dr: -1, dc: -1, name: 'NW' },
] as const;

export function directionCount(): number {
  return DIRECTIONS.length;
}
