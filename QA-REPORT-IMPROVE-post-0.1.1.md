# QA Report — WordHunt Offline IMPROVE (post v0.1.1) Unreleased

**Date:** 2026-09-28 18:02 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/wordhunt-offline`  
**SHA:** `fb09821` (`feat: daily CTA after complete + hint rewarded stub polish`)  
**Prior:** `QA-REPORT-IMPROVE-20260928.md` (v0.1.1 IMPROVE pack **PASS** — streak / howto / A2HS / post-win CTAs — **not re-opened**)  
**STATUS claim:** READY_FOR_QA — `npm test` 23/23; build green; Unreleased daily CTA + hint polish  
**QA:** Independent post-v0.1.1 pass (report only — no product source changes; no GitHub push; no agent messages)  
**Overall:** **PASS**

---

## Summary

Both Master items hold. Unit gate **23/23** and **build green** (tsc + vite + PWA SW, 16 precache). Live preview smoke on `http://127.0.0.1:4173/wordhunt-offline/` confirms:

1. **Daily seed UX after complete** — incomplete Home keeps `Daily Challenge` + `Daily 2026-09-28 ready` + `action=daily`; after daily find-all → Home `#daily-label` = `Daily ✓ · Play endless`, `#daily-meta` = `Next daily after midnight PKT`, `dataset.action=endless`; click routes to endless (HUD category `Animals`, not `Daily`). Persist `wordhunt:v1:daily:2026-09-28` `{completed:true,...}`.
2. **Hint rewarded stub + cue** — hint `aria-label`/`title` = `Hint (reveals a letter)`; with ads present → modal `Rewarded hint (stub)` + Continue → toast e.g. `Hint: letter “F” · 5 left in a 6-letter word` (no full-word spoil); `adsRemoved` → immediate toast, modal stays hidden.

**No new P0/P1.** Residual Lows WH-002 / WH-003 from MVP remain unchanged (not blockers). Prior IMPROVE-20260928 pack left alone.

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
| Browser | Google Chrome headless + puppeteer-core (`/tmp/qa-smoke/smoke-post-011.mjs`); viewport 390×844 |
| Methods | STATUS / CHANGELOG; source (`homeDaily.ts`, `hintCue.ts`, `main.ts`, `index.html`); `npm test`; `npm run build`; interactive UI smoke |
| Zone | Box/user Asia/Karachi (UTC+5); report times PKT |
| Commit | `fb09821b9973cda1390a790ee4cc5ed64262bb8e` |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **23/23 passed** — `tests/placer.test.ts` (9) + `tests/streak.test.ts` (8) + `tests/home-hint.test.ts` (6: incomplete/completed/refreshHome CTA; formatHintToast + lettersLeft; adsRemoved flag) — vitest 2.1.9 |
| `npm run build` | **success** — `tsc && vite build`; PWA `generateSW`; **16 precache entries**; `dist/sw.js` |

---

## Master verification (post v0.1.1 Unreleased)

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | Daily seed UX after complete | **PASS** | Pure helper `homeDailyCta`: completed → label `Daily ✓ · Play endless`, meta `Next daily after midnight PKT`, action `endless`; incomplete → `Daily Challenge` / `Daily ${key} ready` / `daily`. `refreshHome` wires `#daily-label`, `#daily-meta`, `btn-daily.dataset.action`; click handler routes `endless` → `startEndless()` else `startDaily()`. Live: incomplete CTA pass; after daily win + Home → label/meta/action exact match; CTA click → play screen with mode badge `Animals` (endless category), not `Daily`. Daily record persisted completed. PKT seed math untouched (no changer in this commit). Vitest 3 home-CTA cases green. |
| 2 | Hint rewarded-stub modal + clearer cue | **PASS** | `#btn-hint` static + runtime `aria-label`/`title` = `Hint (reveals a letter)`. `doHint`: `adsRemoved` → `applyHintAndToast` immediately; else `showRewardHintModal` (`#reward-hint` h2 “Rewarded hint (stub)” + Continue). Continue → hide + apply. Toast via `formatHintToast`: letter + letters left + word length; no full-word spoil. Live: modal open → Continue → `Hint: letter “F” · 5 left in a 6-letter word`; after Remove ads → hint tap → modal stays hidden, toast `Hint: letter “P” · 5 left in a 6-letter word`. Vitest toast/lettersLeft/adsRemoved cases green. |

---

## Smoke checklist (this IMPROVE only)

| Check | Result |
|-------|--------|
| Incomplete Home daily label + ready meta + action=daily | PASS |
| Completed Home: `Daily ✓ · Play endless` + midnight PKT meta + action=endless | PASS |
| Completed daily home button → endless (not same daily) | PASS (HUD `Animals`, not `Daily`) |
| Hint aria-label / title | PASS |
| Rewarded stub modal + Continue | PASS |
| Toast letters-left / word-length cue (no full-word spoil) | PASS |
| adsRemoved → immediate hint (no modal) | PASS |
| Console / pageerrors on happy path | PASS (`errors []`) |
| Base `/wordhunt-offline/` unchanged | PASS (preview URL + vite config) |

**Not re-verified (prior pack already PASS):** streak PKT, first-run howto, A2HS, post-win CTAs.

---

## Findings

| ID | Severity | Title | Notes |
|----|----------|-------|-------|
| **WH-002** | Low (carry) | UI hardcodes 10×10 (no 8×8 toggle) | Unchanged from MVP; acceptable. |
| **WH-003** | Low (carry) | PNG icons simple placeholders | Unchanged; installable. |

**No new defects** introduced by this Unreleased improve in this QA window.

---

## CLEAR for publish from QA?

**YES — CLEAR** for Unreleased IMPROVE (post v0.1.1) daily CTA + hint polish on dual-cleared v0.1.1 base. Contingent on hosting under base `/wordhunt-offline/` (unchanged). Not a rewrite of tagged v0.1.1; treat as next shippable increment when release process bumps version.

---

## Artifacts

- Report: `/workspace/factory/projects/wordhunt-offline/QA-REPORT-IMPROVE-post-0.1.1.md`
- Inbox note: `/workspace/factory/inbox/QA-NOTE-wordhunt-offline-IMPROVE-post-0.1.1.md`
- Prior IMPROVE QA: `/workspace/factory/projects/wordhunt-offline/QA-REPORT-IMPROVE-20260928.md`
- Smoke script: `/tmp/qa-smoke/smoke-post-011.mjs`
