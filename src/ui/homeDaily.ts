/** Pure helpers for Home daily CTA after complete (post-v0.1.1). */

export type HomeDailyCta = {
  /** Button label text for #daily-label */
  label: string;
  /** Secondary meta / teaser line for #daily-meta */
  meta: string;
  /** Click routes to endless when completed, else daily seed play */
  action: 'daily' | 'endless';
};

/**
 * Home daily button + meta after refresh.
 * Does not touch PKT seed math — only presentation based on completion.
 */
export function homeDailyCta(dailyKey: string, completed: boolean): HomeDailyCta {
  if (completed) {
    return {
      label: 'Daily ✓ · Play endless',
      meta: 'Next daily after midnight PKT',
      action: 'endless',
    };
  }
  return {
    label: 'Daily Challenge',
    meta: `Daily ${dailyKey} ready`,
    action: 'daily',
  };
}
