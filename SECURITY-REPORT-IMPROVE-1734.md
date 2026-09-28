# Security Review — WordHunt Offline Unreleased IMPROVE

| Field | Value |
|-------|--------|
| **Date** | 2026-09-28 17:35 PKT (Asia/Karachi, UTC+5) |
| **Project** | WordHunt Offline (`wordhunt-offline`) — Unreleased IMPROVE |
| **Path** | `/workspace/factory/projects/wordhunt-offline` |
| **Base MVP** | `1757d9d` (Security **PASS_WITH_NOTES** — `SECURITY-REPORT.md`) |
| **Review surface** | Uncommitted working tree on that base (`STATUS` READY_FOR_QA) |
| **Reviewer** | Security Reviewer (autonomous factory) |
| **Gate** | `/workspace/factory/shared/security/RELEASE_GATE.md` |
| **Verdict** | **PASS_WITH_NOTES** |
| **Sign-off** | **CLEAR** |
| **Code edits / git push** | None (review-only) |

---

## Scope

Delta vs MVP `1757d9d` (CHANGELOG Unreleased + STATUS):

1. **Daily streak (PKT)** — `wordhunt:v1:streak` `{ count, lastCompletedKey }`; Home streak line  
2. **First-run howto + A2HS** — `wordhunt:v1:onboarded`; static howto screen; home-only dismissible A2HS tip (`sessionStorage` `wordhunt:a2hs`)  
3. **Post-win CTAs** — endless **New puzzle** / daily **Play endless**; Share + Home retained  
4. **Docs base path** — README + GUIDE document `/wordhunt-offline/` (Vite `base` unchanged from MVP)

**Master focus:** localStorage streak integrity · XSS in howto/CTAs/A2HS · no new network · PWA same-origin · MVP regression (ads stubs, textContent grid, secrets, SW hygiene).

**In scope:** on-disk `src/`, `index.html`, `vite.config.ts`, `public/`, `tests/streak.test.ts`, docs STATUS/CHANGELOG, built `dist/` as present.

**Out of scope:** Product code changes, git commit/push, live AdMob/Billing, hosting TLS.

---

## Verdict summary

**PASS_WITH_NOTES** — no ship blockers for this IMPROVE pack. Streak parse is defensive (NaN / non-finite / non-string key handled); howto/A2HS/win CTAs are static HTML or `textContent` only; still a single same-origin words JSON `fetch`; Vite PWA config unchanged in spirit from MVP; production `npm audit --omit=dev` remains **0**. Carry-forward notes: client-local streak vanity (expected offline), MVP `.gitignore` / future-secrets hygiene, and **dev-only** Vitest audit CVEs (same as MVP F7 — Olivia risk-accept or bump before public GitHub publish).

**Sign-off: CLEAR** for QA continuation of Unreleased IMPROVE.

---

## Ship blockers

**None.**

---

## Delta findings

### D1 — localStorage streak integrity — PASS (notes)

| Severity | Info / Low note |
|----------|-----------------|
| Evidence | `src/game/persist.ts:128–165`, `src/main.ts:79–86`, `tests/streak.test.ts` |

- Key `wordhunt:v1:streak`; payload `{ count, lastCompletedKey }` only — **no credentials**.  
- `getStreak()` (`:128–141`): `JSON.parse` in try/catch; `count` via `Number` + `Number.isFinite(count) && count > 0 ? Math.floor(count) : 0` → **NaN / Infinity / negative → 0**.  
- `lastCompletedKey`: accepted only if `typeof === 'string'`, else `''` — objects / numbers dropped (prototype-pollution-style `__proto__` object values do not become the key; `__proto__` JSON own-property does not pollute `Object.prototype` under modern engines; verified shape extraction is field-whitelisted).  
- `recordDailyComplete` (`:153–165`): same-day idempotent; consecutive via `shiftDailyKey(..., -1)`; skip resets to 1 on **next complete** (not on open).  
- Display: `$('#streak-count').textContent = String(streak.count)` (`main.ts:83`) — no HTML sink.  
- **Tampering note (non-blocking):** Any user can edit localStorage and inflate `count` / forge `lastCompletedKey`. Expected for offline vanity metrics with no server trust boundary; corrupt keys fail consecutive match and reset to 1 on next legit complete. Optional hardening later: regex-validate `YYYY-MM-DD` on read (product polish, not a gate blocker).  
- Quota / private-mode: existing `writeRaw` / `readRaw` try/catch ignore.

**Fix:** None required.

### D2 — Onboarded + A2HS session flag — PASS

| Severity | Info |
|----------|------|
| Evidence | `persist.ts:167–173`; `main.ts:43`, `:412–449`, `:485–500` |

- `onboarded` stored as literal `'true'` / `'false'`; `isOnboarded()` is strict `=== 'true'`.  
- A2HS dismiss: `sessionStorage.setItem('wordhunt:a2hs', '1')` only — no PII, no install ping.  
- Tip shown only on Home; hidden on Play/Howto and when `display-mode: standalone`.  
- No `beforeinstallprompt` analytics / no third-party install SDK.

**Fix:** None required.

### D3 — XSS howto / CTAs / A2HS — PASS

| Severity | Info |
|----------|------|
| Evidence | `index.html:48–59`, `:88–91`, `:28`, `:81`; `main.ts:342–350`, `:357–358` |

- Howto copy and A2HS tip (EN + Roman Urdu) are **static markup** in `index.html` — allowed; not built from user/storage input.  
- Win primary label set via **`textContent`** (`'Play endless'` / `'New puzzle'`); win stats via `textContent`.  
- Streak line shell is static HTML; count is `textContent`.  
- Grid/word-list still clear-only `innerHTML = ''` + `createElement` + `textContent` (`main.ts:190`, `:227–230`).  
- Grep: no `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` in `src/` / `index.html`.

**Fix:** None required.

### D4 — Network / telemetry — PASS

| Severity | Info |
|----------|------|
| Evidence | `src/puzzle/words.ts:35–38`; greps across `src/`, `public/`, `dist/` |

- Application `fetch` still **only** same-origin word bank: `` `${import.meta.env.BASE_URL}words/en-clean.json` ``.  
- No new `XMLHttpRequest`, `sendBeacon`, analytics, gtag, AdMob network, or A2HS/install telemetry.  
- Ads stubs unchanged — `console.debug` only (`src/ads/stubs.ts`).  
- Share remains user-initiated `navigator.share` / clipboard plain text.

**Fix:** None required.

### D5 — PWA same-origin / Vite config — PASS

| Severity | Info |
|----------|------|
| Evidence | `vite.config.ts` (unchanged vs `1757d9d`); `public/manifest.webmanifest`; `dist/sw.js`; `main.ts:504–514` |

- `base: '/wordhunt-offline/'` already on MVP base; IMPROVE docs only clarify Pages path — **config spirit unchanged**.  
- Manifest `start_url` / `scope`: `./`; local icons only.  
- Built SW: `precacheAndRoute` of same-origin assets only; `NavigationRoute` → `index.html`; **no external precache URLs**; no GA route registration.  
- `registerSW({ immediate: true })` via `virtual:pwa-register` — same MVP pattern.

**Fix:** None required.

### D6 — Dependencies (delta) — PASS_WITH_NOTES (carry-forward)

| Severity | Notes (dev tooling) |
|----------|---------------------|
| Evidence | `npm test`; `npm audit --omit=dev`; `npm audit` |

```text
npm test                → 17/17 passed (9 placer + 8 streak/onboard/PKT)
npm audit --omit=dev    → 0 vulnerabilities
npm audit (all)         → 5 issues (3 moderate, 1 high, 1 critical) via vitest/dev chain
```

Same documented MVP F7 risk: production bundle not affected; Olivia risk-accept or Vitest bump before public GitHub publish per RELEASE_GATE.

---

## MVP regression — Still OK

| MVP finding | IMPROVE status |
|-------------|----------------|
| Ads/IAP stubs only; no keys | **Still OK** — `src/ads/stubs.ts` unchanged vs base |
| Grid / word list `textContent` | **Still OK** — clear-only `innerHTML`; letters/words via `textContent` |
| No secrets in source | **Still OK** — grep only hits stub comment “AdMob” |
| SW hygiene / same-origin precache | **Still OK** — vite PWA block unchanged; SW local-only |
| Offline-only words fetch | **Still OK** — no new network clients |
| `.gitignore` missing `.env*` | **Still OK as Low note** — unchanged; process when monetization lands |
| Authn/authz/uploads/admin | **Still N/A** |

---

## Release-gate checklist (IMPROVE)

| # | Item | Result |
|---|------|--------|
| 1 | Authn / sessions / tokens | N/A |
| 2 | Authz / IDOR / roles | N/A |
| 3 | Secrets & config | PASS — stubs only |
| 4 | API surface & rate limits | N/A (static client) |
| 5 | Injection (XSS / etc.) | PASS — static howto/A2HS; CTAs/`streak` via `textContent` |
| 6 | Uploads & file access | N/A |
| 7 | Dependencies & supply chain | PASS_WITH_NOTES — prod 0; dev vitest carry-forward |
| 8 | Logging / error leakage | PASS — debug stubs only |
| 9 | Transport (TLS / cookies / HSTS) | Deploy-time; app sets no insecure cookies |
| 10 | Admin / debug surfaces | PASS |

Master focus mapping: streak integrity ✓ · XSS howto/CTA/A2HS ✓ · no new network ✓ · PWA same-origin ✓ · MVP regression ✓

---

## Notes (non-blocking)

1. Client can forge streak in DevTools — vanity only; do not treat streak as anti-cheat / leaderboard trust without a server.  
2. Optional: validate `lastCompletedKey` with `/^\d{4}-\d{2}-\d{2}$/` on read for cleaner corrupt-state handling.  
3. Keep A2HS copy static; never interpolate storage into HTML.  
4. Carry-forward: extend `.gitignore` for `.env*` when live ads land; Olivia accept or bump Vitest before GitHub Manager publish.  
5. Optional host CSP (`default-src 'self'`) when publishing.

---

## Sign-off

| Item | Value |
|------|--------|
| **Verdict** | **PASS_WITH_NOTES** |
| **Ship blockers** | **None** |
| **Sign-off** | **CLEAR** |
| **Report path** | `/workspace/factory/projects/wordhunt-offline/SECURITY-REPORT-IMPROVE-1734.md` |

Reviewed against Master IMPROVE focus + `/workspace/factory/shared/security/RELEASE_GATE.md`. No product code edited. No `git push` performed. Ready for QA continuation of Unreleased IMPROVE on dual-cleared MVP base.
