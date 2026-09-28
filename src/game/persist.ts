/** localStorage persistence — keys wordhunt:v1:* */

const PREFIX = 'wordhunt:v1:';

export type Settings = { muted: boolean; adsRemoved: boolean };

export type DailyRecord = {
  completed: boolean;
  wordsFound: number;
  totalWords: number;
  finishedAt?: string;
};

export type Streak = {
  count: number;
  lastCompletedKey: string;
};

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readRaw(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    /* ignore quota */
  }
}

export function getGamesPlayed(): number {
  const v = readRaw('gamesPlayed');
  const n = v == null ? 0 : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function incrementGamesPlayed(): number {
  const n = getGamesPlayed() + 1;
  writeRaw('gamesPlayed', String(n));
  return n;
}

export function getWordsFoundTotal(): number {
  const v = readRaw('wordsFoundTotal');
  const n = v == null ? 0 : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function addWordsFoundTotal(count: number): number {
  const n = getWordsFoundTotal() + count;
  writeRaw('wordsFoundTotal', String(n));
  return n;
}

export function getSettings(): Settings {
  const raw = readRaw('settings');
  if (!raw) return { muted: false, adsRemoved: false };
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      muted: Boolean(parsed.muted),
      adsRemoved: Boolean(parsed.adsRemoved),
    };
  } catch {
    return { muted: false, adsRemoved: false };
  }
}

export function setSettings(settings: Settings): void {
  writeRaw('settings', JSON.stringify(settings));
}

export function getDailyRecord(dailyKey: string): DailyRecord | null {
  const raw = readRaw(`daily:${dailyKey}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyRecord;
  } catch {
    return null;
  }
}

export function saveDailyRecord(dailyKey: string, record: DailyRecord): void {
  const prev = getDailyRecord(dailyKey);
  const completed = record.completed || Boolean(prev?.completed);
  writeRaw(
    `daily:${dailyKey}`,
    JSON.stringify({
      completed,
      wordsFound: Math.max(prev?.wordsFound ?? 0, record.wordsFound),
      totalWords: record.totalWords,
      finishedAt: completed ? (prev?.finishedAt ?? record.finishedAt ?? new Date().toISOString()) : undefined,
    }),
  );
}

/**
 * Shift a YYYY-MM-DD civil date by deltaDays (calendar days).
 * Daily keys are Asia/Karachi calendar dates — treat as civil, not UTC instants.
 */
export function shiftDailyKey(key: string, deltaDays: number): string {
  const parts = key.split('-').map(Number);
  const y = parts[0]!;
  const m = parts[1]!;
  const d = parts[2]!;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function getStreak(): Streak {
  const raw = readRaw('streak');
  if (!raw) return { count: 0, lastCompletedKey: '' };
  try {
    const parsed = JSON.parse(raw) as Partial<Streak>;
    const count = Number(parsed.count);
    const lastCompletedKey = typeof parsed.lastCompletedKey === 'string' ? parsed.lastCompletedKey : '';
    return {
      count: Number.isFinite(count) && count > 0 ? Math.floor(count) : 0,
      lastCompletedKey,
    };
  } catch {
    return { count: 0, lastCompletedKey: '' };
  }
}

function writeStreak(streak: Streak): void {
  writeRaw('streak', JSON.stringify(streak));
}

/**
 * On daily complete: if yesterday (PKT calendar) was the last completed day → streak+1,
 * else reset to 1. Same-day re-complete is idempotent (does not bump again).
 * Missing a day breaks streak only on the next complete — not on app open.
 */
export function recordDailyComplete(dailyKey: string): Streak {
  const prev = getStreak();
  if (prev.lastCompletedKey === dailyKey && prev.count >= 1) {
    return prev;
  }
  const yesterday = shiftDailyKey(dailyKey, -1);
  const next: Streak =
    prev.lastCompletedKey === yesterday && prev.count >= 1
      ? { count: prev.count + 1, lastCompletedKey: dailyKey }
      : { count: 1, lastCompletedKey: dailyKey };
  writeStreak(next);
  return next;
}

export function isOnboarded(): boolean {
  return readRaw('onboarded') === 'true';
}

export function setOnboarded(value = true): void {
  writeRaw('onboarded', value ? 'true' : 'false');
}

/** Test helper — clear all wordhunt keys. */
export function clearAllPersist(): void {
  if (!canUseStorage()) return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  for (const k of keys) localStorage.removeItem(k);
}
