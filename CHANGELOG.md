# Changelog

## 0.1.2 — 2026-09-28

### Daily seed UX after complete
- When today’s daily is completed, Home `#daily-label` → `Daily ✓ · Play endless`; secondary meta `Next daily after midnight PKT`; button routes to endless (no same-seed re-entry)
- Incomplete: keep `Daily Challenge` + ready meta
- Vitest: home refresh / completed-daily label cases
- PKT daily seed math unchanged

### Hint polish (rewarded stub + cue)
- Hint tap when ads not removed: stub modal “Rewarded hint (stub)” + Continue, then apply hint; `adsRemoved` → apply immediately
- Toast includes letter reveal + letters left / word length (no full-word spoil)
- `#btn-hint` `aria-label` / `title`: `Hint (reveals a letter)`

## 0.1.1 — 2026-09-28

### Daily streak (PKT)
- On daily complete, persist `wordhunt:v1:streak` `{ count, lastCompletedKey }`
- Consecutive Asia/Karachi calendar days increment; a skipped day resets to 1 on next complete (not on open)
- Home shows `Streak: N` when count ≥ 1
- Vitest: consecutive days, skip-day reset, same-day idempotent, PKT key boundaries

### First-run howto + A2HS
- Persist `wordhunt:v1:onboarded`; first visit opens How to play; Got it → onboarded + Home
- Home-only dismissible Add to Home Screen tip (`sessionStorage` `wordhunt:a2hs`); hidden on Play/Howto
- EN primary + one-line Roman Urdu on tip

### Post-win CTAs + docs base path
- Win overlay: endless → primary **New puzzle**; daily completed → primary **Play endless** (Retry removed — no awkward same-daily re-roll)
- Share + Home kept; ads stubs unchanged
- README + GUIDE-roman-urdu document preview/Pages base `/wordhunt-offline/`

## 0.1.0 — 2026-09-28

- MVP: 10×10 8-direction word hunt, Animals/Food/Travel, Daily PKT seed, hint + ads stubs, share, PWA offline
