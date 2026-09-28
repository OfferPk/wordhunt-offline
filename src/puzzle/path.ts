/** Contiguous straight-line path validation for word selection. */

export type Cell = { r: number; c: number };

/** Normalize path cells into a word string from the grid. */
export function pathToWord(grid: string[][], cells: Cell[]): string {
  return cells.map(({ r, c }) => grid[r]?.[c] ?? '').join('');
}

/**
 * Accept only contiguous cells in a single straight direction (8-way).
 * Reject empty, single-cell, bends, gaps, duplicates, OOB.
 */
export function isValidPath(grid: string[][], cells: Cell[]): boolean {
  if (cells.length < 2) return false;
  const n = grid.length;
  if (n === 0) return false;
  const m = grid[0]?.length ?? 0;

  const seen = new Set<string>();
  for (const { r, c } of cells) {
    if (r < 0 || c < 0 || r >= n || c >= m) return false;
    const key = `${r},${c}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }

  const dr = cells[1]!.r - cells[0]!.r;
  const dc = cells[1]!.c - cells[0]!.c;
  if (dr === 0 && dc === 0) return false;
  if (Math.abs(dr) > 1 || Math.abs(dc) > 1) return false;

  for (let i = 1; i < cells.length; i++) {
    const pr = cells[i]!.r - cells[i - 1]!.r;
    const pc = cells[i]!.c - cells[i - 1]!.c;
    if (pr !== dr || pc !== dc) return false;
  }
  return true;
}

/** Match path word (forward) against target; case-insensitive letters. */
export function pathMatchesWord(grid: string[][], cells: Cell[], word: string): boolean {
  if (!isValidPath(grid, cells)) return false;
  const formed = pathToWord(grid, cells).toUpperCase();
  return formed === word.toUpperCase();
}

/** True if path spells any of the words (exact). */
export function matchPlacedWord(
  grid: string[][],
  cells: Cell[],
  words: readonly string[],
): string | null {
  if (!isValidPath(grid, cells)) return null;
  const formed = pathToWord(grid, cells).toUpperCase();
  for (const w of words) {
    if (w.toUpperCase() === formed) return w.toUpperCase();
  }
  return null;
}
