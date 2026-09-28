import { describe, it, expect } from 'vitest';
import {
  placeWords,
  generatePuzzle,
  verifyPlacement,
  DIRECTIONS,
  directionCount,
  isValidPath,
  pathMatchesWord,
  matchPlacedWord,
  mulberry32,
  hashStringToUint32,
  createDailyRng,
  dailyKeyKarachi,
  dailySeed,
} from '../src/puzzle';
import {
  createSession,
  trySelect,
  isWin,
  applyHint,
} from '../src/game/session';

const SAMPLE = [
  'CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'BEAR', 'FROG', 'WOLF',
  'HORSE', 'TIGER', 'EAGLE', 'MOUSE',
];

describe('placeWords', () => {
  it('places all requested words on the grid', () => {
    const rng = mulberry32(42);
    const words = SAMPLE.slice(0, 8);
    const puzzle = placeWords(words, rng, { size: 10, requireAll: true });
    expect(puzzle.placed.length).toBe(words.length);
    expect(puzzle.words.sort()).toEqual([...words].map((w) => w.toUpperCase()).sort());
    expect(verifyPlacement(puzzle)).toBe(true);
  });

  it('covers all 8 directions across many placements', () => {
    expect(directionCount()).toBe(8);
    expect(DIRECTIONS.length).toBe(8);
    const seen = new Set<string>();
    for (let seed = 1; seed <= 80 && seen.size < 8; seed++) {
      const puzzle = placeWords(SAMPLE.slice(0, 10), mulberry32(seed), { size: 12 });
      for (const p of puzzle.placed) {
        seen.add(`${p.dr},${p.dc}`);
      }
    }
    expect(seen.size).toBe(8);
  });

  it('fills every cell with a letter', () => {
    const puzzle = placeWords(['CAT', 'DOG', 'BIRD'], mulberry32(7), { size: 8 });
    for (const row of puzzle.grid) {
      for (const ch of row) {
        expect(ch).toMatch(/^[A-Z]$/);
      }
    }
  });
});

describe('path validation', () => {
  const grid = [
    ['C', 'A', 'T', 'X'],
    ['X', 'X', 'X', 'X'],
    ['D', 'O', 'G', 'X'],
    ['X', 'X', 'X', 'X'],
  ];

  it('accepts a straight contiguous path that spells the word', () => {
    const cells = [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
    ];
    expect(isValidPath(grid, cells)).toBe(true);
    expect(pathMatchesWord(grid, cells, 'CAT')).toBe(true);
    expect(matchPlacedWord(grid, cells, ['CAT', 'DOG'])).toBe('CAT');
  });

  it('rejects bent, gapped, and single-cell paths', () => {
    expect(isValidPath(grid, [{ r: 0, c: 0 }])).toBe(false);
    expect(
      isValidPath(grid, [
        { r: 0, c: 0 },
        { r: 0, c: 1 },
        { r: 1, c: 1 }, // bend
      ]),
    ).toBe(false);
    expect(
      isValidPath(grid, [
        { r: 0, c: 0 },
        { r: 0, c: 2 }, // gap
      ]),
    ).toBe(false);
    expect(pathMatchesWord(grid, [{ r: 0, c: 0 }, { r: 0, c: 1 }], 'CAT')).toBe(false);
  });
});

describe('daily seed', () => {
  it('is reproducible for the same Karachi date key', () => {
    const key = '2026-09-28';
    expect(dailySeed(key)).toBe(hashStringToUint32(`wordhunt-daily|${key}`));
    const a = generatePuzzle(SAMPLE, createDailyRng(key), { size: 10, count: 6 });
    const b = generatePuzzle(SAMPLE, createDailyRng(key), { size: 10, count: 6 });
    expect(a.grid).toEqual(b.grid);
    expect(a.words).toEqual(b.words);
  });

  it('dailyKeyKarachi uses UTC+5 calendar day', () => {
    // 2026-09-27 22:00 UTC = 2026-09-28 03:00 PKT
    const d = new Date('2026-09-27T22:00:00Z');
    expect(dailyKeyKarachi(d)).toBe('2026-09-28');
    // 2026-09-28 18:00 UTC = 2026-09-28 23:00 PKT still same day
    expect(dailyKeyKarachi(new Date('2026-09-28T18:00:00Z'))).toBe('2026-09-28');
    // 2026-09-28 20:00 UTC = 2026-09-29 01:00 PKT next day
    expect(dailyKeyKarachi(new Date('2026-09-28T20:00:00Z'))).toBe('2026-09-29');
  });
});

describe('session win + hint', () => {
  it('wins when all placed words are found via selection', () => {
    const puzzle = placeWords(['CAT', 'DOG'], mulberry32(99), { size: 8 });
    const session = createSession(puzzle, { mode: 'endless', category: 'Test' });
    for (const p of puzzle.placed) {
      const matched = trySelect(session, p.cells);
      expect(matched).toBe(p.word);
    }
    expect(isWin(session)).toBe(true);
  });

  it('hint reveals a letter without crashing when words remain', () => {
    const puzzle = placeWords(['CAT', 'DOG', 'BIRD'], mulberry32(3), { size: 8 });
    const session = createSession(puzzle, { mode: 'endless', category: 'Test' });
    const hint = applyHint(session, mulberry32(1));
    expect(hint).not.toBeNull();
    expect(hint!.letter).toMatch(/^[A-Z]$/);
    expect(session.hintedCells.has(`${hint!.r},${hint!.c}`)).toBe(true);
    // spam hints should not throw
    for (let i = 0; i < 40; i++) {
      applyHint(session, mulberry32(i + 10));
    }
    expect(true).toBe(true);
  });
});
