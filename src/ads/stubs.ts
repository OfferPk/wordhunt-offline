/**
 * Monetization stubs — no real ad SDK / billing in MVP.
 * Wire AdMob / Play Billing later; keep call sites stable.
 */

import { getSettings, setSettings } from '../game/persist';

export type AdResult = { ok: boolean; reason?: string };

function adsRemoved(): boolean {
  return getSettings().adsRemoved;
}

/** Banner placeholder (no-op when ads removed). */
export function showBanner(): AdResult {
  if (adsRemoved()) return { ok: false, reason: 'adsRemoved' };
  // MVP: log-only stub
  if (typeof console !== 'undefined') console.debug('[ads] showBanner stub');
  return { ok: true };
}

/** Interstitial between puzzles (stub always "shows"). */
export function showInterstitial(): AdResult {
  if (adsRemoved()) return { ok: false, reason: 'adsRemoved' };
  if (typeof console !== 'undefined') console.debug('[ads] showInterstitial stub');
  return { ok: true };
}

/**
 * Rewarded ad stub — always grants reward in MVP.
 * Hook for later real rewarded ads.
 */
export function showRewarded(): AdResult {
  if (typeof console !== 'undefined') console.debug('[ads] showRewarded stub — grant');
  return { ok: true };
}

/**
 * Hint via rewarded ad hook. Always grants in MVP.
 * @returns true if hint should be applied
 */
export function rewardedHint(): boolean {
  const result = showRewarded();
  return result.ok;
}

/** One-time remove-ads IAP stub — flips local flag. */
export function purchaseRemoveAds(): AdResult {
  const s = getSettings();
  setSettings({ ...s, adsRemoved: true });
  if (typeof console !== 'undefined') console.debug('[ads] purchaseRemoveAds stub');
  return { ok: true };
}

/** Alias used by some call sites / docs. */
export function removeAds(): AdResult {
  return purchaseRemoveAds();
}

export const ads = {
  showBanner,
  showInterstitial,
  showRewarded,
  rewardedHint,
};

export const iap = {
  removeAds: purchaseRemoveAds,
  purchaseRemoveAds,
};
