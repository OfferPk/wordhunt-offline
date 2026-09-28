# WordHunt Offline — Product

| Field | Value |
|-------|--------|
| Name | WordHunt Offline |
| Slug | wordhunt-offline |
| Project ID | proj_wordhunt_offline_001 |
| Genre | Word / casual puzzle |
| Platforms | Mobile web PWA (P0), desktop browser |
| Monetization v1 | Ads + remove-ads stubs (no live SDK) |
| PRD | `/workspace/factory/research/PRD-wordhunt-offline.md` |

## One-liner

Offline word-search PWA — find hidden English words on a letter grid, no account required.

## MVP scope (PRD §5)

1. Grid generator — 8×8 / 10×10, 8-direction placement, random fill  
2. English word lists — ≥3 categories × ≥80 clean words (`public/words/en-clean.json`)  
3. Drag / tap-path select; find-all wins  
4. localStorage progress (`wordhunt:v1:*`)  
5. Daily puzzle seeded Asia/Karachi  
6. Hints — one letter of random remaining word (rewarded stub)  
7. Ads + remove-ads hooks (`src/ads/stubs.ts`)  
8. README + GUIDE-roman-urdu.md + STATUS.md + PWA offline  

## Non-goals

TubeSort; ArrowPath in this repo; Urdu lists; real IAP/billing; NYT/Wordle branding.
