/** Place words on a letter grid in 8 directions; fill unused cells. */

import { DIRECTIONS } from './directions';
import type { RngFn } from './rng';

export type PlacedWord = {
  word: string;
  r: number;
  c: number;
  dr: number;
  dc: number;
  cells: Array<{ r: number; c: number }>;
};

export type PuzzleGrid = {
  size: number;
  grid: string[][];
  placed: PlacedWord[];
  words: string[];
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function emptyGrid(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

function canPlace(
  grid: (string | null)[][],
  word: string,
  r: number,
  c: number,
  dr: number,
  dc: number,
): boolean {
  const size = grid.length;
  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    if (rr < 0 || cc < 0 || rr >= size || cc >= size) return false;
    const existing = grid[rr]![cc];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

function writeWord(
  grid: (string | null)[][],
  word: string,
  r: number,
  c: number,
  dr: number,
  dc: number,
): Array<{ r: number; c: number }> {
  const cells: Array<{ r: number; c: number }> = [];
  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    grid[rr]![cc] = word[i]!;
    cells.push({ r: rr, c: cc });
  }
  return cells;
}

function shuffleInPlace<T>(arr: T[], rng: RngFn): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

export type PlaceOptions = {
  size?: number;
  maxAttemptsPerWord?: number;
  /** Prefer shorter-first then shuffle within length bands for placeability. */
};

/**
 * Place as many words as possible on size×size grid.
 * Returns puzzle with placed words (all letters uppercase).
 * Throws if fewer than minPlace words succeed (default: all requested).
 */
export function placeWords(
  wordsIn: readonly string[],
  rng: RngFn,
  opts: PlaceOptions & { requireAll?: boolean } = {},
): PuzzleGrid {
  const size = opts.size ?? 10;
  const maxAttempts = opts.maxAttemptsPerWord ?? 200;
  const requireAll = opts.requireAll ?? true;

  const words = wordsIn
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter((w) => w.length >= 3 && w.length <= size);

  // Longer words first for better packing
  const ordered = [...words].sort((a, b) => b.length - a.length);

  const grid = emptyGrid(size);
  const placed: PlacedWord[] = [];
  const dirs = [...DIRECTIONS];

  for (const word of ordered) {
    let success = false;
    const tryDirs = [...dirs];
    shuffleInPlace(tryDirs, rng);

    for (let attempt = 0; attempt < maxAttempts && !success; attempt++) {
      const dir = tryDirs[attempt % tryDirs.length]!;
      const r = Math.floor(rng() * size);
      const c = Math.floor(rng() * size);
      if (!canPlace(grid, word, r, c, dir.dr, dir.dc)) continue;
      const cells = writeWord(grid, word, r, c, dir.dr, dir.dc);
      placed.push({ word, r, c, dr: dir.dr, dc: dir.dc, cells });
      success = true;
    }

    if (!success && requireAll) {
      // Retry whole puzzle with looser attempts once by falling through —
      // caller may regenerate. For requireAll we throw.
      throw new Error(`Could not place word: ${word}`);
    }
  }

  // Fill nulls with random letters
  const filled: string[][] = grid.map((row) =>
    row.map((ch) => ch ?? LETTERS[Math.floor(rng() * LETTERS.length)]!),
  );

  return {
    size,
    grid: filled,
    placed,
    words: placed.map((p) => p.word),
  };
}

/**
 * Generate a puzzle: pick `count` words from bank, place on grid.
 * Retries on placement failure.
 */
export function generatePuzzle(
  bank: readonly string[],
  rng: RngFn,
  opts: { size?: number; count?: number; maxRetries?: number } = {},
): PuzzleGrid {
  const size = opts.size ?? 10;
  const count = opts.count ?? 8;
  const maxRetries = opts.maxRetries ?? 40;

  const pool = bank
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter((w) => w.length >= 3 && w.length <= size);
  if (pool.length < count) {
    throw new Error(`Word bank too small: need ${count}, have ${pool.length}`);
  }

  for (let retry = 0; retry < maxRetries; retry++) {
    const pick = [...pool];
    shuffleInPlace(pick, rng);
    const selected = pick.slice(0, count);
    try {
      return placeWords(selected, rng, { size, requireAll: true });
    } catch {
      /* retry */
    }
  }
  throw new Error('Failed to generate puzzle after retries');
}

/** Verify every placed word can be read back from the grid. */
export function verifyPlacement(puzzle: PuzzleGrid): boolean {
  for (const p of puzzle.placed) {
    for (let i = 0; i < p.word.length; i++) {
      const r = p.r + p.dr * i;
      const c = p.c + p.dc * i;
      if (puzzle.grid[r]?.[c] !== p.word[i]) return false;
    }
  }
  return true;
}
