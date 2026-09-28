/** Play session: found words, win check, hints. */

import type { PuzzleGrid, PlacedWord } from '../puzzle/placer';
import { matchPlacedWord, type Cell } from '../puzzle/path';
import type { RngFn } from '../puzzle/rng';

export type SessionState = {
  puzzle: PuzzleGrid;
  found: Set<string>;
  hintedCells: Set<string>; // "r,c"
  startedAt: number;
  mode: 'endless' | 'daily';
  category: string;
  dailyKey?: string;
};

export function createSession(
  puzzle: PuzzleGrid,
  opts: { mode: 'endless' | 'daily'; category: string; dailyKey?: string },
): SessionState {
  return {
    puzzle,
    found: new Set(),
    hintedCells: new Set(),
    startedAt: Date.now(),
    mode: opts.mode,
    category: opts.category,
    dailyKey: opts.dailyKey,
  };
}

export function trySelect(session: SessionState, cells: Cell[]): string | null {
  const remaining = session.puzzle.words.filter((w) => !session.found.has(w));
  const match = matchPlacedWord(session.puzzle.grid, cells, remaining);
  if (!match) return null;
  session.found.add(match);
  return match;
}

export function isWin(session: SessionState): boolean {
  return session.found.size >= session.puzzle.words.length && session.puzzle.words.length > 0;
}

export function foundCount(session: SessionState): number {
  return session.found.size;
}

export function totalWords(session: SessionState): number {
  return session.puzzle.words.length;
}

function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

/**
 * Reveal one letter of a random unfound word (first unrevealed cell).
 * Returns the cell + letter, or null if nothing left.
 */
export function applyHint(session: SessionState, rng: RngFn): { r: number; c: number; letter: string; word: string } | null {
  const unfound: PlacedWord[] = session.puzzle.placed.filter((p) => !session.found.has(p.word));
  if (unfound.length === 0) return null;

  const idx = Math.floor(rng() * unfound.length);
  const target = unfound[idx]!;

  for (const cell of target.cells) {
    const key = cellKey(cell.r, cell.c);
    if (!session.hintedCells.has(key)) {
      session.hintedCells.add(key);
      return {
        r: cell.r,
        c: cell.c,
        letter: session.puzzle.grid[cell.r]![cell.c]!,
        word: target.word,
      };
    }
  }
  // All letters already hinted — mark whole word found? No — just pick another word or reveal word fully as last resort
  // Reveal next available letter from any unfound word
  for (const p of unfound) {
    for (const cell of p.cells) {
      const key = cellKey(cell.r, cell.c);
      if (!session.hintedCells.has(key)) {
        session.hintedCells.add(key);
        return {
          r: cell.r,
          c: cell.c,
          letter: session.puzzle.grid[cell.r]![cell.c]!,
          word: p.word,
        };
      }
    }
  }
  return null;
}

export function elapsedSeconds(session: SessionState, now = Date.now()): number {
  return Math.max(0, Math.floor((now - session.startedAt) / 1000));
}
