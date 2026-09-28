# WordHunt Offline — Status

**Status:** READY_FOR_QA  
**Updated:** 2026-09-28T17:19:30+05:00 (PKT)  
**Assignee:** Software Engineer 4  
**Project ID:** proj_wordhunt_offline_001

## Gates

| Gate | Result |
|------|--------|
| `npm test` | **9/9 passed** (placeWords, path accept/reject, seed reproducibility, Karachi dailyKey, win, hint, 8-direction coverage, fill) |
| `npm run build` | **green** (tsc + vite + PWA SW; words JSON precached) |

## Shipped (MVP)

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
- No git push / GitHub publish (per brief)  
- Path: `/workspace/factory/projects/wordhunt-offline`  
- TubeSort / ArrowPath **not** in this repo  
