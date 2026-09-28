# WordHunt Offline — Status

**Status:** READY_FOR_QA  
**Updated:** 2026-09-28T18:00:43+05:00 (PKT)  
**Version:** 0.1.1 + Unreleased improve (daily CTA + hint polish)  
**Assignee:** Software Engineer 4  
**Project ID:** proj_wordhunt_offline_001  
**Release:** https://github.com/OfferPk/wordhunt-offline/releases/tag/v0.1.1  
**Pages:** https://offerpk.github.io/wordhunt-offline/

## Gates

| Gate | Result |
|------|--------|
| `npm test` | **23/23 passed** (17 prior + 6 home CTA / hint cue) |
| `npm run build` | **green** (tsc + vite + PWA SW; base `/wordhunt-offline/`) |
| Prior v0.1.1 | SHIPPED (streak / howto / A2HS / win CTAs) |

## Unreleased (this IMPROVE)

1. **Daily seed UX after complete** — Home `#daily-label` → `Daily ✓ · Play endless` when today’s daily done; meta `Next daily after midnight PKT`; click routes to endless. Incomplete keeps Daily Challenge + ready. PKT seed math unchanged.
2. **Hint polish** — Rewarded stub modal when ads not removed; immediate apply when `adsRemoved`; toast letter + letters left / word length; hint button `aria-label`/`title` `Hint (reveals a letter)`.

## Shipped (v0.1.1)

1. Daily streak (PKT)  
2. First-run howto + A2HS  
3. Post-win CTAs  
4. Docs base `/wordhunt-offline/`  

## Notes

- Path: `/workspace/factory/projects/wordhunt-offline`
- Do not rebuild prior IMPROVE pack items
