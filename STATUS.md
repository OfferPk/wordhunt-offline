# WordHunt Offline — Status

**Status:** SHIPPED  
**Updated:** 2026-09-28T17:40:00+05:00 (PKT)  
**Version:** 0.1.1  
**Assignee:** Coding Agent (IMPROVE pack)  
**Project ID:** proj_wordhunt_offline_001  
**Release:** https://github.com/OfferPk/wordhunt-offline/releases/tag/v0.1.1  
**Pages:** https://offerpk.github.io/wordhunt-offline/

## Gates

| Gate | Result |
|------|--------|
| `npm test` | **17/17 passed** (9 placer/path/seed/session + 8 streak/onboard/PKT) |
| `npm run build` | **green** (tsc + vite + PWA SW; base `/wordhunt-offline/`) |
| QA IMPROVE | PASS (QA-REPORT-IMPROVE-20260928.md) |
| Security IMPROVE | PASS_WITH_NOTES (SECURITY-REPORT-IMPROVE-1734.md) |

## v0.1.1 (Unreleased improve dual-clear)

1. **Daily streak (PKT)** — `wordhunt:v1:streak` `{ count, lastCompletedKey }`; Home `Streak: N` when ≥1; break on next complete after skip  
2. **First-run howto + A2HS** — `wordhunt:v1:onboarded`; home-only dismissible install tip (+ Roman Urdu line)  
3. **Post-win CTAs** — endless **New puzzle** / daily **Play endless**; no same-daily Retry  
4. Docs base path `/wordhunt-offline/` in README + GUIDE  

## Shipped (MVP 0.1.0)

1. Grid placer — 10×10 default, 8 directions, random fill  
2. Word bank — Animals / Food / Travel (≥80 each) in `public/words/en-clean.json`  
3. Drag path select + find-all win  
4. Daily seed `wordhunt-daily|YYYY-MM-DD` (Asia/Karachi)  
5. Endless + category themes  
6. Hint via `ads.rewardedHint()` stub  
7. Ads/IAP stubs + `wordhunt:v1:settings` `{ muted, adsRemoved }`  
8. Persistence: gamesPlayed, wordsFoundTotal, daily:{date}  
9. PWA icons 192/512 + manifest  
10. Docs: README, GUIDE-roman-urdu, PRODUCT, STATUS  

## Notes

- Original soft teal/coral IP; no NYT / Wordle / Wordscapes branding  
- Path: `/workspace/factory/projects/wordhunt-offline`
