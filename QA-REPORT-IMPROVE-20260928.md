# QA Report — WordHunt Offline IMPROVE (post v0.1.0) Unreleased

**Date:** 2026-09-28 17:36 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/wordhunt-offline`  
**Prior:** `QA-REPORT.md` (v0.1.0 **PASS**)  
**STATUS claim:** READY_FOR_QA — `npm test` 17/17; build green; Unreleased IMPROVE pack  
**QA:** Independent IMPROVE pass (report only — no product source changes; no GitHub push; no agent messages)  
**Overall:** **PASS**

---

## Summary

All three Master IMPROVE items hold. Unit gate **17/17** and **build green** (tsc + vite + PWA SW, 16 precache). Live preview smoke on `http://127.0.0.1:4173/wordhunt-offline/` confirms: first-run howto → Got it → onboarded + home A2HS tip (EN + Roman Urdu), tip hidden on Play / session-dismiss, endless win **New puzzle** (no Retry), daily win **Play endless** + `wordhunt:v1:streak` `{count:1,lastCompletedKey:2026-09-28}` + home `Streak: 1`. Docs explicitly document base `/wordhunt-offline/`.

**No new P0/P1.** Prior Low **WH-001** (docs base path) **resolved** by this IMPROVE. Residual Lows WH-002 / WH-003 from MVP remain unchanged (not blockers).

| Severity | Count (this pass) |
|----------|------------------:|
| Critical / P0 | 0 |
| High / P1     | 0 |
| Medium        | 0 |
| Low (carry)   | 2 (WH-002, WH-003) |

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | `npx vite preview --host 127.0.0.1 --port 4173` → **Local: `http://127.0.0.1:4173/wordhunt-offline/`** (`vite.config.ts` `base: '/wordhunt-offline/'`) |
| Browser | Google Chrome headless + puppeteer-core (temp `/tmp/qa-smoke`); viewport 390×844 |
| Methods | STATUS / CHANGELOG / README / GUIDE; source review (`persist.ts`, `main.ts`, `index.html`); `npm test`; `npm run build`; interactive UI smoke |
| Zone | Box/user Asia/Karachi (UTC+5); report times PKT |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **17/17 passed** — `tests/placer.test.ts` (9) + `tests/streak.test.ts` (8: shiftDailyKey, streak consecutive / skip-reset / same-day idempotent / no decay on read / PKT key boundaries, onboarded flag) — vitest 2.1.9 |
| `npm run build` | **success** — `tsc && vite build`; PWA `generateSW`; **16 precache entries**; `dist/sw.js` |

---

## Master verification (IMPROVE)

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | Daily streak PKT (Asia/Karachi day boundary) | **PASS** | `recordDailyComplete` / `getStreak` persist `wordhunt:v1:streak` `{ count, lastCompletedKey }`. Consecutive PKT days +1; skip day → next complete resets to 1; same-day idempotent; break only on next complete (not on open). Vitest PKT: `2026-09-27T22:00:00Z` → key `2026-09-28`; `2026-09-28T20:00:00Z` → `2026-09-29`; streak 26→27→28→3. Live: daily win → streak JSON `count:1,lastCompletedKey:2026-09-28`; home shows `Streak: 1` when ≥1. |
| 2 | First-run howto + home A2HS tip | **PASS** | Clear storage → reload → howto visible, `onboarded` null, A2HS hidden on howto. Got it → `wordhunt:v1:onboarded=true`, home visible, A2HS visible with EN “Add to Home Screen” + Roman Urdu “Home screen par add karein…”. OK → `sessionStorage wordhunt:a2hs=1`, tip hidden. Play → A2HS stays hidden (`showScreen` home-only). |
| 3 | Post-win CTAs + `/wordhunt-offline/` docs | **PASS** | Endless win primary **New puzzle**; daily win primary **Play endless**; no Retry button in DOM. Share + Home retained. README L23–30 + GUIDE §4 step 4 document Vite `base` **`/wordhunt-offline/`** (dev/preview/Pages — not site root). Live URL `…/wordhunt-offline/`; SW + manifest HTTP 200 under base. |

---

## Smoke checklist (IMPROVE-focused)

| Check | Result |
|-------|--------|
| First visit → How to play auto-open | PASS |
| Got it → onboarded + Home | PASS |
| Home A2HS tip EN + Roman Urdu | PASS |
| A2HS dismiss session + hidden on Play | PASS |
| Endless find-all → New puzzle CTA | PASS |
| Daily find-all → Play endless + streak persist | PASS |
| Home Streak: 1 after daily complete | PASS |
| Daily meta completed label | PASS (`Daily 2026-09-28 ✓ completed`) |
| Console / pageerrors on happy path | PASS (`errors []`) |
| Base path assets | PASS (sw/manifest 200) |

---

## Findings

| ID | Severity | Title | Notes |
|----|----------|-------|-------|
| **WH-001** | ~~Low~~ **RESOLVED** | Docs omit `/wordhunt-offline/` | Fixed in Unreleased: README + GUIDE spell base path. |
| **WH-002** | Low (carry) | UI hardcodes 10×10 (no 8×8 toggle) | Unchanged from v0.1.0; MVP acceptable. |
| **WH-003** | Low (carry) | PNG icons simple placeholders | Unchanged; installable. |

**No new defects** introduced by IMPROVE pack in this QA window.

---

## CLEAR for publish from QA?

**YES — CLEAR** for Unreleased IMPROVE (post v0.1.0) on dual-cleared MVP base. Still contingent on hosting under base `/wordhunt-offline/` (now documented). Not a rewrite of tagged v0.1.0; treat as next shippable increment when release process bumps version.

---

## Artifacts

- Report: `/workspace/factory/projects/wordhunt-offline/QA-REPORT-IMPROVE-20260928.md`
- Inbox note: `/workspace/factory/inbox/QA-NOTE-wordhunt-offline-IMPROVE-20260928.md`
- Prior: `/workspace/factory/projects/wordhunt-offline/QA-REPORT.md`
