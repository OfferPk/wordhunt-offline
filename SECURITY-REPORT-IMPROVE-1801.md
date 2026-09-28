# Security Review — WordHunt Offline post-v0.1.1 Unreleased IMPROVE

| Field | Value |
|-------|--------|
| **Date** | 2026-09-28 18:01 PKT (Asia/Karachi, UTC+5) |
| **Project** | WordHunt Offline (`wordhunt-offline`) — Unreleased IMPROVE (daily CTA + hint polish) |
| **Path** | `/workspace/factory/projects/wordhunt-offline` |
| **HEAD** | `fb09821` — feat: daily CTA after complete + hint rewarded stub polish |
| **Base** | `9dc7adb` v0.1.1 (streak/howto/A2HS) — prior `SECURITY-REPORT-IMPROVE-1734.md` **PASS_WITH_NOTES**; MVP `SECURITY-REPORT.md` **PASS_WITH_NOTES** |
| **Reviewer** | Security Reviewer (autonomous factory) |
| **Gate** | `/workspace/factory/shared/security/RELEASE_GATE.md` |
| **Verdict** | **PASS_WITH_NOTES** |
| **Sign-off** | **CLEAR** |
| **Code edits / git push** | None (review-only) |

---

## Scope

Delta vs `9dc7adb` (CHANGELOG Unreleased + STATUS READY_FOR_QA):

1. **Daily seed UX after complete** — Home `#daily-label` / `#daily-meta` via `homeDailyCta`; completed → endless route; incomplete keeps Daily Challenge  
2. **Hint polish** — rewarded stub modal when `!adsRemoved`; immediate apply when `adsRemoved`; toast letter + letters-left / word length; `#btn-hint` aria/title  

**Master focus:** localStorage daily / `adsRemoved` · XSS toast/modal/CTA strings · offline-only (words JSON only) · `homeDaily` / `hintCue` helpers · regression streak/A2HS/win CTAs/PWA · `npm test` (~23) · `npm audit --omit=dev`.

**In scope:** on-disk `src/` (esp. `persist.ts`, `homeDaily.ts`, `hintCue.ts`, `main.ts`, `ads/stubs.ts`), `index.html`, `vite.config.ts`, `tests/home-hint.test.ts`, docs STATUS/CHANGELOG, prior IMPROVE-1734.

**Out of scope:** Product code changes, git commit/push, live AdMob/Billing, hosting TLS.

---

## Verdict summary

**PASS_WITH_NOTES** — no ship blockers for this Unreleased IMPROVE on HEAD `fb09821`. Settings `adsRemoved`/`muted` are Boolean-coerced on read with try/catch; daily CTA presentation is pure helpers + `textContent`; hint toast uses `textContent` (no full-word spoil); rewarded stub modal is static HTML (show/hide only); still a single same-origin words JSON `fetch`; ads stubs / `persist.ts` / Vite PWA config **unchanged** vs `9dc7adb`. Carry-forward notes: client-local daily/`adsRemoved` vanity, optional stricter `getDailyRecord` coerce, MVP `.gitignore` / `.env*` hygiene, **dev-only** Vitest audit CVEs (same as IMPROVE-1734 / MVP F7).

**Sign-off: CLEAR** for QA continuation of Unreleased IMPROVE. Does not regress prior PASS_WITH_NOTES.

---

## Ship blockers

**None.**

---

## Delta findings

### D1 — localStorage daily / settings (`adsRemoved`) — PASS (notes)

| Severity | Info / Low note |
|----------|-----------------|
| Evidence | `src/game/persist.ts:69–109`; `src/main.ts:72–94`, `:362–369`, `:411–417`; `tests/home-hint.test.ts` |

**Settings (`getSettings` / `setSettings`):**

- Key `wordhunt:v1:settings`; shape `{ muted, adsRemoved }` only — **no credentials**.  
- `getSettings` (`:69–80`): `JSON.parse` in try/catch; returns **field-whitelisted** object with `muted: Boolean(parsed.muted)`, `adsRemoved: Boolean(parsed.adsRemoved)`. Corrupt JSON → defaults `{ false, false }`.  
- Prototype-pollution-style `__proto__` JSON own-property does not set `adsRemoved`/`muted` under this whitelist; only those two fields are read.  
- `setSettings` writes `JSON.stringify(settings)` of caller-supplied `Settings` (typed booleans from app paths).

**Daily (`getDailyRecord` / `saveDailyRecord`):**

- Key `wordhunt:v1:daily:${dailyKey}`; payload `{ completed, wordsFound, totalWords, finishedAt? }` — **no credentials**.  
- `getDailyRecord` (`:87–94`): parse in try/catch; returns `null` on failure. **Less coercive than settings/streak** — casts `as DailyRecord` without `Boolean`/`Number` normalize (see Notes).  
- Consumers: `Boolean(rec?.completed)` in `refreshHome` (`main.ts:77`); `saveDailyRecord` merges with `Boolean(prev?.completed)`, `Math.max` on wordsFound, ISO `finishedAt` — values re-serialized, **not** injected into HTML.  
- `dailyKey` for Home CTA comes from `dailyKeyKarachi()` (`rng.ts:34–41`), not from storage — PKT seed math unchanged.

**Tampering note (non-blocking):** User can edit localStorage to forge `completed` / inflate counts / flip `adsRemoved`. Expected offline vanity / local entitlement stub with no server trust boundary. `Boolean("false") === true` quirk if a string were stored for `adsRemoved` — only via manual/corrupt storage, not app write path.

**Fix:** None required. Optional later: coerce daily fields like settings/streak.

### D2 — XSS toast / modal / daily-label / hint cue — PASS

| Severity | Info |
|----------|------|
| Evidence | `src/ui/homeDaily.ts:16–28`; `src/ui/hintCue.ts:9–15`; `src/main.ts:78–79`, `:376–418`, `:515–521`; `index.html:76`, `:89–94`, `:68` |

- `homeDailyCta` returns **static** label/meta when completed; incomplete meta interpolates `dailyKey` (PKT civil date from helper) — applied via **`textContent`** (`main.ts:78–79`).  
- `formatHintToast(letter, wordLen, lettersLeft)` builds a string with letter + counts; **full word not included**; applied via **`toast.textContent`** (`main.ts:402`). Letter originates from puzzle grid hint path. Even malicious letter content would not execute under `textContent`.  
- Rewarded stub modal (`#reward-hint`) is **static markup** in `index.html:89–94` (“Rewarded hint (stub)” / Continue); `showRewardHintModal` / `hideRewardHintModal` only toggle `hidden`.  
- Hint button label: constant `HINT_BUTTON_LABEL` → `setAttribute('aria-label')` / `.title` (`main.ts:515–517`); matching static attrs in HTML.  
- Grid/word-list: clear-only `innerHTML = ''` (`main.ts:193`, `:230`) + `createElement` + `textContent`.  
- Grep: no `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` in `src/` / `index.html`. No dynamic HTML sinks for this IMPROVE.

**Fix:** None required.

### D3 — Offline-only / ads stubs — PASS

| Severity | Info |
|----------|------|
| Evidence | `src/puzzle/words.ts:35–38`; `src/ads/stubs.ts`; greps; `git diff 9dc7adb..fb09821` |

- Application `fetch` still **only** same-origin word bank: `` `${import.meta.env.BASE_URL}words/en-clean.json` ``.  
- No new `XMLHttpRequest`, `sendBeacon`, analytics, gtag, AdMob network, or install telemetry.  
- `src/ads/stubs.ts` and `src/game/persist.ts` **unchanged** vs `9dc7adb` — stubs remain `console.debug` only; `rewardedHint` always grants locally; `purchaseRemoveAds` flips local `adsRemoved`.  
- Delta files: `homeDaily.ts`, `hintCue.ts`, `main.ts`, `index.html`, `style.css`, tests, docs — no network clients added.

**Fix:** None required.

### D4 — Pure helpers (`homeDaily` / `hintCue`) — PASS

| Severity | Info |
|----------|------|
| Evidence | `src/ui/homeDaily.ts`; `src/ui/hintCue.ts`; `tests/home-hint.test.ts` (6 cases) |

- No DOM, no storage, no network in helpers.  
- `lettersLeftInWord` counts unhinted cells; `void word` keeps API without spoiling toast.  
- Vitest covers incomplete/completed CTA, persist→CTA, toast shape (no full word), `adsRemoved` round-trip.

**Fix:** None required.

### D5 — Dependencies / tests — PASS_WITH_NOTES (carry-forward)

| Severity | Notes (dev tooling) |
|----------|---------------------|
| Evidence | `npm test`; `npm audit --omit=dev`; `npm audit` |

```text
npm test                → 23/23 passed (9 placer + 8 streak + 6 home CTA / hint cue)
npm audit --omit=dev    → 0 vulnerabilities
npm audit (all)         → 5 issues (3 moderate, 1 high, 1 critical) via vitest/dev chain
```

Same documented MVP / IMPROVE-1734 risk: production bundle not affected; Olivia risk-accept or Vitest bump before public GitHub publish per RELEASE_GATE.

---

## Regression — Still OK (vs IMPROVE-1734 / MVP)

| Prior finding | This IMPROVE (`fb09821`) |
|---------------|--------------------------|
| Streak parse defensive; vanity localStorage | **Still OK** — `persist.ts` streak path unchanged; Home still `textContent` for count |
| Onboarded + A2HS session flag | **Still OK** — first-run howto / home-only A2HS / `sessionStorage` dismiss unchanged in spirit |
| Win CTAs textContent (Play endless / New puzzle) | **Still OK** — `configureWinCtas` unchanged pattern |
| Ads/IAP stubs only; no keys | **Still OK** — `stubs.ts` byte-unchanged vs `9dc7adb` |
| Grid / word list textContent | **Still OK** — clear-only `innerHTML` |
| No secrets in source | **Still OK** — grep only stub comment “AdMob” / “billing” |
| SW hygiene / same-origin precache | **Still OK** — `vite.config.ts` unchanged (`base: '/wordhunt-offline/'`) |
| Offline-only words fetch | **Still OK** — no new network |
| `.gitignore` missing `.env*` | **Still OK as Low note** — unchanged; process when monetization lands |
| Authn/authz/uploads/admin | **Still N/A** |

---

## Release-gate checklist (this IMPROVE)

| # | Item | Result |
|---|------|--------|
| 1 | Authn / sessions / tokens | N/A |
| 2 | Authz / IDOR / roles | N/A |
| 3 | Secrets & config | PASS — stubs only |
| 4 | API surface & rate limits | N/A (static client) |
| 5 | Injection (XSS / etc.) | PASS — textContent CTAs/toast; static reward modal |
| 6 | Uploads & file access | N/A |
| 7 | Dependencies & supply chain | PASS_WITH_NOTES — prod 0; dev vitest carry-forward |
| 8 | Logging / error leakage | PASS — debug stubs only |
| 9 | Transport (TLS / cookies / HSTS) | Deploy-time; app sets no insecure cookies |
| 10 | Admin / debug surfaces | PASS |

Master focus mapping: daily/`adsRemoved` persist ✓ · XSS toast/modal/CTA ✓ · offline-only ✓ · homeDaily/hintCue ✓ · regression ✓ · tests/audit ✓

---

## Notes (non-blocking)

1. Client can forge daily `completed` / `adsRemoved` in DevTools — local vanity / stub entitlement only; do not treat as anti-cheat or paid entitlement without a server.  
2. Optional: harden `getDailyRecord` like `getSettings`/`getStreak` — coerce `completed` with `Boolean`, numbers with `Number.isFinite`, `finishedAt` only if `typeof === 'string'`.  
3. Keep toast/modal/CTA paths on `textContent` or static HTML; never interpolate storage into `innerHTML`.  
4. Carry-forward: extend `.gitignore` for `.env*` when live ads land; Olivia accept or bump Vitest before GitHub Manager publish.  
5. Optional host CSP (`default-src 'self'`) when publishing.

---

## Sign-off

| Item | Value |
|------|--------|
| **Verdict** | **PASS_WITH_NOTES** |
| **Ship blockers** | **None** |
| **Sign-off** | **CLEAR** |
| **HEAD** | `fb09821` |
| **Report path** | `/workspace/factory/projects/wordhunt-offline/SECURITY-REPORT-IMPROVE-1801.md` |

Reviewed against Master post-v0.1.1 Unreleased IMPROVE focus + `/workspace/factory/shared/security/RELEASE_GATE.md`. No product code edited. No `git push` performed. Does not regress IMPROVE-1734 / MVP PASS_WITH_NOTES. Ready for QA continuation of Unreleased IMPROVE.
