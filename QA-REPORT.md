# QA Report — WordHunt Offline MVP v0.1.0

**Date:** 2026-09-28 17:25 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/wordhunt-offline`  
**PRD:** `/workspace/factory/research/PRD-wordhunt-offline.md`  
**STATUS claim:** READY_FOR_QA — `npm test` 9/9; build green (PWA SW)  
**QA:** Independent pass (report only — no product source changes; no GitHub push; no agent messages)  
**Overall:** **PASS**

---

## Summary

MVP scope holds. Unit gates match SE4 claims (**9/9** tests, **build green** with vite-plugin-pwa SW). Live preview smoke on `http://127.0.0.1:4173/wordhunt-offline/` confirms: boot + Daily PKT label, endless Play 10×10 / 8 words, hint stub, full find-all win via 8-direction path select, Daily reproducibility, ads/remove-ads stubs, SW active, **offline reload + play** with empty BAD_LOGS.

**No P0/P1 ship blockers.** Residuals are Low (docs base-path clarity; UI size locked to 10×10; simple PNG icons).

| Severity | Count |
|----------|------:|
| Critical / P0 | 0 |
| High / P1     | 0 |
| Medium        | 0 |
| Low           | 3 |

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | `npx vite preview --host 127.0.0.1 --port 4173` → **Local: `http://127.0.0.1:4173/wordhunt-offline/`** (`vite.config.ts` `base: '/wordhunt-offline/'`) |
| Browser | Google Chrome headless + puppeteer-core; viewport 390×844 |
| Methods | PRD / STATUS / README / GUIDE / PRODUCT; source review; `npm test`; `npm run build`; HTTP asset checks; interactive UI + offline smoke |
| Zone | Box/user Asia/Karachi (UTC+5); report times PKT |

**Note:** During this QA window (~17:22 PKT) SE4 (or concurrent factory work) updated `vite.config.ts` (`base`), `src/puzzle/words.ts` (`import.meta.env.BASE_URL`), and `public/manifest.webmanifest` (relative `start_url`/`scope`/icons). Final verdict is against **post-change** tree after re-`npm test` / `npm run build` / re-smoke.

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **9/9 passed** (`tests/placer.test.ts`, vitest 2.1.9) — placeWords, 8-direction coverage, fill, path accept/reject, daily seed reproducibility, `dailyKeyKarachi` UTC+5 boundaries, session win, hint |
| `npm run build` | **success** — `tsc && vite build`; PWA `generateSW`; **16 precache entries** including `words/en-clean.json`, icons, manifest, JS/CSS (`dist/sw.js`) |

---

## Master verification

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | Offline word search (PWA / SW / no network for core play) | **PASS** | SW registers at `/wordhunt-offline/sw.js`; precache lists `words/en-clean.json` + app shell. Puppeteer: `setOfflineMode(true)` → reload → home `Daily 2026-09-28 ready` → Play → **100 cells / 8 words**. No pageerrors / reqfails. |
| 2 | 8-direction word placer | **PASS** | `src/puzzle/directions.ts` exports 8 dirs (E/W/S/N/SE/SW/NE/NW). Unit test covers all 8 across seeds. Live select found words on mixed directions (SHRIMP…DOG all matched). |
| 3 | en-clean categories | **PASS** | `public/words/en-clean.json`: Animals **99**, Food **100**, Travel **100**; scrubbing field documented; spot-check blocklist hit **0**. UI theme select Animals/Food/Travel/All. |
| 4 | Daily PKT seed (Asia/Karachi) | **PASS** | `dailyKeyKarachi` uses UTC+5 offset; seed key `wordhunt-daily\|YYYY-MM-DD`. Unit boundaries (27 22:00Z → 28; 28 20:00Z → 29). Live: home `Daily 2026-09-28 ready`; two Daily starts → **identical 100-letter grids**. |
| 5 | Ads stubs present | **PASS** | `src/ads/stubs.ts`: `showBanner` / `showInterstitial` / `showRewarded` / `rewardedHint` / `purchaseRemoveAds`. Live console debug stubs; Remove ads → `adsRemoved: true` in `wordhunt:v1:settings`; hint grants via rewarded stub. No live AdMob/Billing SDK. |
| 6 | GUIDE-roman-urdu + README adequate | **PASS** (w/ Low residual) | Both present, linked, cover install/run/play/daily/hint/ads/offline troubleshooting. Roman Urdu GUIDE meets factory naming. Residual: docs still say “usually localhost:5173” without spelling `/wordhunt-offline/` — preview CLI prints the correct base URL. |

---

## Smoke checklist

| Check | Result |
|-------|--------|
| Home branding WordHunt + daily meta | PASS (`Daily 2026-09-28 ready`) |
| Endless Play → 10×10 grid + 8 word list | PASS (Animals sample) |
| Hint reveals letter + toast | PASS (`Hint: letter “S” revealed`, 1 `.hinted`) |
| Drag/path select all words → win overlay | PASS (8/8, `winVisible: true`) |
| Daily Challenge mode + seed stable | PASS (`DAILY_SAME true`) |
| Remove ads stub persists | PASS |
| Mute / How to / Share buttons wired | PASS (present in DOM; mute/howto in source) |
| Manifest + icons + SW | PASS (HTTP 200; SW active) |
| Offline reload + Play | PASS |
| Console clean on happy path | PASS (`BAD_LOGS []`) |
| Broken imports / runtime errors | PASS (tsc + live boot) |
| Missing assets | PASS (JS/CSS/words/icons/sw/manifest 200 under base) |

---

## Findings (residuals only)

| ID | Severity | Title | Notes |
|----|----------|-------|-------|
| **WH-001** | **Low** | Docs omit explicit `/wordhunt-offline/` base path | README/GUIDE say open localhost:5173 / preview without subdirectory. Vite preview prints correct `…/wordhunt-offline/`. Root `/` alone 302/does not load hashed assets. Fix: one-line docs note for GH Pages / preview base. |
| **WH-002** | **Low** | UI hardcodes 10×10 (no 8×8 toggle) | PRD mentions 8×8 / 10×10; generator supports `size`; MVP play uses 10. Acceptable for v0.1. |
| **WH-003** | **Low** | PNG icons are tiny/simple placeholders | `icon-192.png` 800 B; 512 ~4 KB. Valid PNGs + SVG mark exist; fine for MVP installability, polish later. |

---

## CLEAR for publish from QA?

**YES — CLEAR for publish** (MVP), contingent on hosting under base `/wordhunt-offline/` (or equivalent project Pages path) as configured. Not cleared for root-path-only ZIP hosts without changing `base` / docs.

---

## Artifacts

- Report: `/workspace/factory/projects/wordhunt-offline/QA-REPORT.md`
- Inbox note: `/workspace/factory/inbox/QA-NOTE-wordhunt-offline-20260928.md`
