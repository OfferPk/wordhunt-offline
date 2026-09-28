# WordHunt Offline

**Offline word-search PWA** — find hidden English words on a letter grid. No account, works after first load.

> Roman Urdu guide: **[GUIDE-roman-urdu.md](./GUIDE-roman-urdu.md)**

## Stack

- Vite + TypeScript
- DOM letter grid (mobile portrait)
- vite-plugin-pwa (service worker + manifest)
- localStorage persistence (`wordhunt:v1:*`)
- Vitest unit tests

## Quick start

```bash
cd /workspace/factory/projects/wordhunt-offline
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

```bash
npm test          # vitest
npm run build     # tsc + vite build → dist/
npm run preview   # serve production build
```

## Play

| Mode | Description |
|------|-------------|
| **Play** | Endless — random words from Animals / Food / Travel / All |
| **Daily Challenge** | Same seeded grid for everyone on a given **Asia/Karachi (UTC+5)** calendar day |

Controls:

- **Drag** across letters in a straight line (8 directions), or keep a continuous tap-path
- **Hint** — reveals one letter of a remaining word (rewarded-ad stub; always grants in MVP)
- Mute toggles haptics (`navigator.vibrate`)

## Word list scrubbing

Bundled bank: `public/words/en-clean.json` (≥3 categories × ≥80 family-safe English words).

**Scrubbing approach:** curated common nouns only; manual blocklist pass excluding slurs, explicit, drug, and hate terms; spot-checked before ship. Documented in the JSON `scrubbing` field. No NYT / Wordle / Wordscapes branding or asset clones.

## Monetization (stubs only)

`src/ads/stubs.ts`:

- `ads.showBanner()` / `ads.showInterstitial()` / `ads.showRewarded()` / `ads.rewardedHint()`
- `iap.purchaseRemoveAds()` → persists `wordhunt:v1:settings.adsRemoved`

No real AdMob / Play Billing keys in MVP.

## Project layout

```
src/puzzle/   rng, directions, path, placer, words
src/game/     session, persist
src/ads/      monetization stubs
src/main.ts   UI + input
tests/        vitest coverage
public/       icons, manifest, words/en-clean.json
```

## Docs

- [PRODUCT.md](./PRODUCT.md) — product summary
- [STATUS.md](./STATUS.md) — build status
- [GUIDE-roman-urdu.md](./GUIDE-roman-urdu.md) — install & play (Roman Urdu)

## License / IP

Original word-search IP. Not affiliated with NYT Games, Wordle, Wordscapes, or Word Search Explorer.
