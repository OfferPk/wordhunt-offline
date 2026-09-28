/** Hint toast + rewarded stub presentation helpers. */

export const HINT_BUTTON_LABEL = 'Hint (reveals a letter)';

/**
 * Toast after a letter reveal — keeps letter, adds length / letters-left cue.
 * Does not spoil the full word.
 */
export function formatHintToast(
  letter: string,
  wordLen: number,
  lettersLeftInWord: number,
): string {
  return `Hint: letter “${letter}” · ${lettersLeftInWord} left in a ${wordLen}-letter word`;
}

/** Count cells of `word` in session that are not yet hinted (after applyHint). */
export function lettersLeftInWord(
  word: string,
  wordCells: { r: number; c: number }[],
  hintedCells: Set<string>,
): number {
  let left = 0;
  for (const cell of wordCells) {
    if (!hintedCells.has(`${cell.r},${cell.c}`)) left += 1;
  }
  void word;
  return left;
}
