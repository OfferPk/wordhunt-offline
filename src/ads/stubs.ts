/**
 * Ad bridge. The real work happens in public/js/ads.js (AdMob via Capacitor on Android,
 * no-op in a browser where rewarded ads simply grant). Rewarded ads only from a tap;
 * interstitials only after a finished puzzle (gated: never on launch/exit or in the first session).
 */

type AdsGlobal = {
  showBanner?: () => Promise<void>;
  showInterstitial?: () => Promise<boolean>;
  showRewarded?: (onReward: () => void) => Promise<void>;
};

function bridge(): AdsGlobal | null {
  const w = globalThis as unknown as { Ads?: AdsGlobal };
  return w.Ads ?? null;
}

export function showBanner(): void {
  /* no banner in this game */
}

/** Call only from a post-puzzle button (win card). */
export function showInterstitialAfterPuzzle(): void {
  const a = bridge();
  if (a?.showInterstitial) void a.showInterstitial();
}

/** Rewarded ad; resolves true only if the reward was earned. In a browser it grants. */
export function showRewarded(): Promise<boolean> {
  const a = bridge();
  if (!a?.showRewarded) return Promise.resolve(true);
  return new Promise((resolve) => {
    let got = false;
    void a.showRewarded!(() => {
      got = true;
    }).then(() => resolve(got));
  });
}

export const ads = { showBanner, showInterstitialAfterPuzzle, showRewarded };
