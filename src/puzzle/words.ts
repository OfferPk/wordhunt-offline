/** Load and filter embedded English word bank. */

export type WordBank = {
  version: number;
  language: string;
  scrubbing: string;
  categories: Record<string, string[]>;
};

export const CATEGORY_NAMES = ['Animals', 'Food', 'Travel'] as const;
export type CategoryName = (typeof CATEGORY_NAMES)[number];

/** Flat unique list across all categories. */
export function allWords(bank: WordBank): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of Object.values(bank.categories)) {
    for (const w of list) {
      const u = w.toUpperCase();
      if (!seen.has(u)) {
        seen.add(u);
        out.push(u);
      }
    }
  }
  return out;
}

export function wordsForCategory(bank: WordBank, category: string): string[] {
  const list = bank.categories[category];
  if (!list) return [];
  return list.map((w) => w.toUpperCase());
}

export async function loadWordBank(url = `${import.meta.env.BASE_URL}words/en-clean.json`): Promise<WordBank> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load word bank: ${res.status}`);
  return (await res.json()) as WordBank;
}
