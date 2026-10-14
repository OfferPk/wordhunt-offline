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

Open the printed local URL (usually `http://localhost:5173/wordhunt-offline/`).

Vite `base` is **`/wordhunt-offline/`** (GitHub Pages / static preview path). Dev and `npm run preview` serve under that prefix — open `/wordhunt-offline/`, not the site root.

```bash
npm test          # vitest
npm run build     # tsc + vite build → dist/
npm run preview   # serve production build at /wordhunt-offline/
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

## v0.2.0 (Android + meta layer)

- Android: Capacitor 8 project in `android/` (`com.offerpk.wordhunt`, `webDir: dist`). `.github/workflows/android.yml` runs tests, `npm run build`, `cap sync` and builds a signed AAB/APK on every `v*` tag. Vite `base` is now `./` so the same build works on GitHub Pages and in the app.
- AdMob (`public/js/ads.js`, Google **test** IDs in `public/js/ads-config.js`): rewarded ads only from a tap (hint, 24h skin trial); interstitials only from the win card's buttons, never on launch/exit or in the first session (`public/js/adgate.js`). The fake "Remove ads" button is gone.
- Meta layer (`public/js/metakit.js` + `meta-config.js`): How to play card, 7-day daily reward + seeded Daily challenge, Skin Shop (tile styles + backdrops, tap to preview, 24h rewarded trial), achievements + Stats, first-puzzle coach, accessibility settings. Coins are cosmetic only.
- Store: `LAUNCH_CHECKLIST.md`, `store/LISTING-v0.2.md`, `store/screenshots/01–08.png`, Play Store guard workflow (`play-store.yml`).
- Tests: `npm test` (vitest + meta/ads unit + store guard) and `npm run build && node tests/meta.browser.cjs http://localhost:PORT/` against `dist/`.
