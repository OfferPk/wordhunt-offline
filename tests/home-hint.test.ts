import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  clearAllPersist,
  saveDailyRecord,
  getDailyRecord,
} from '../src/game/persist';
import { homeDailyCta } from '../src/ui/homeDaily';
import {
  formatHintToast,
  lettersLeftInWord,
  HINT_BUTTON_LABEL,
} from '../src/ui/hintCue';
import { createSession, applyHint } from '../src/game/session';
import { placeWords, mulberry32 } from '../src/puzzle';
import { getSettings, setSettings } from '../src/game/persist';

/** Minimal localStorage for node vitest env. */
function installMemoryStorage(): void {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
}

describe('home daily CTA after complete', () => {
  beforeEach(() => {
    installMemoryStorage();
    clearAllPersist();
  });

  afterEach(() => {
    clearAllPersist();
  });

  it('incomplete: Daily Challenge + ready meta + daily action', () => {
    const cta = homeDailyCta('2026-09-28', false);
    expect(cta.label).toBe('Daily Challenge');
    expect(cta.meta).toBe('Daily 2026-09-28 ready');
    expect(cta.action).toBe('daily');
  });

  it('completed: Daily ✓ · Play endless + midnight teaser + endless action', () => {
    const cta = homeDailyCta('2026-09-28', true);
    expect(cta.label).toBe('Daily ✓ · Play endless');
    expect(cta.meta).toBe('Next daily after midnight PKT');
    expect(cta.action).toBe('endless');
  });

  it('refreshHome case: completion from persist drives completed CTA', () => {
    const key = '2026-09-28';
    expect(getDailyRecord(key)).toBeNull();
    expect(homeDailyCta(key, Boolean(getDailyRecord(key)?.completed)).label).toBe(
      'Daily Challenge',
    );

    saveDailyRecord(key, {
      completed: true,
      wordsFound: 8,
      totalWords: 8,
      finishedAt: '2026-09-28T12:00:00.000Z',
    });
    const rec = getDailyRecord(key);
    expect(rec?.completed).toBe(true);
    const cta = homeDailyCta(key, Boolean(rec?.completed));
    expect(cta.label).toBe('Daily ✓ · Play endless');
    expect(cta.meta).toBe('Next daily after midnight PKT');
    expect(cta.action).toBe('endless');
  });
});

describe('hint cue toast + adsRemoved path', () => {
  beforeEach(() => {
    installMemoryStorage();
    clearAllPersist();
  });

  afterEach(() => {
    clearAllPersist();
  });

  it('formatHintToast includes letter + length + letters left (no full word)', () => {
    const msg = formatHintToast('C', 5, 4);
    expect(msg).toBe('Hint: letter “C” · 4 left in a 5-letter word');
    expect(msg.toLowerCase()).not.toContain('horse');
    expect(HINT_BUTTON_LABEL).toBe('Hint (reveals a letter)');
  });

  it('lettersLeftInWord counts unhinted cells after applyHint', () => {
    const puzzle = placeWords(['CAT', 'DOG'], mulberry32(7), { size: 8, requireAll: true });
    const session = createSession(puzzle, { mode: 'endless', category: 'Animals' });
    const hint = applyHint(session, mulberry32(1));
    expect(hint).not.toBeNull();
    const placed = session.puzzle.placed.find((p) => p.word === hint!.word)!;
    const left = lettersLeftInWord(hint!.word, placed.cells, session.hintedCells);
    expect(left).toBe(hint!.word.length - 1);
    const toast = formatHintToast(hint!.letter, hint!.word.length, left);
    expect(toast).toContain(`${left} left in a ${hint!.word.length}-letter word`);
    expect(toast).toContain(`“${hint!.letter}”`);
  });

  it('adsRemoved flag is readable for immediate-hint path', () => {
    expect(getSettings().adsRemoved).toBe(false);
    setSettings({ muted: false, adsRemoved: true });
    expect(getSettings().adsRemoved).toBe(true);
  });
});
