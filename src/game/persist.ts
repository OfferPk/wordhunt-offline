/** localStorage persistence — keys wordhunt:v1:* */

const PREFIX = 'wordhunt:v1:';

export type Settings = { muted: boolean; adsRemoved: boolean };

export type DailyRecord = {
  completed: boolean;
  wordsFound: number;
  totalWords: number;
  finishedAt?: string;
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
