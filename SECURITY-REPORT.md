# Security Review — WordHunt Offline MVP

| Field | Value |
|-------|--------|
| **Date** | 2026-09-28 17:21 PKT (Asia/Karachi, UTC+5) |
| **Project** | WordHunt Offline (`wordhunt-offline`) v0.1.0 |
| **Path** | `/workspace/factory/projects/wordhunt-offline` |
| **Status at review** | READY_FOR_QA |
| **Reviewer** | Security Reviewer (autonomous factory) |
| **Gate** | `/workspace/factory/shared/security/RELEASE_GATE.md` |
| **Verdict** | **PASS_WITH_NOTES** |
| **Sign-off** | **CLEAR** |
| **Code edits / git push** | None (review-only) |

---

## Scope

Offline word-search PWA (Vite + TypeScript + vite-plugin-pwa). No accounts, localStorage persistence, ads/IAP stubs only. Master focus areas:

1. XSS in word lists / UI  
2. Unsafe HTML (`innerHTML`, `document.write`, `eval`, etc.)  
3. Secrets (API keys, AdMob, billing)  
4. PWA / service worker hygiene  
5. Offline-only — no unexpected telemetry / third-party network  
6. Dependency audit  

Also covered against the shared release-gate checklist (authn/authz N/A for this MVP; secrets; injection; deps; logging; transport notes for static host).

**In scope:** `src/`, `public/`, `index.html`, `vite.config.ts`, `package.json` / lockfile, `dist/` build artifacts (`sw.js`, manifest, assets), `.gitignore`, docs (README, PRODUCT, STATUS, GUIDE).

**Out of scope:** Product feature changes, live AdMob/Play Billing (not present), hosting TLS/HSTS (deploy-time).

---

## Verdict summary

**PASS_WITH_NOTES** — no ship blockers for this offline MVP. Runtime surface is static same-origin assets with safe DOM APIs, stub monetization, and a standard Workbox precache SW. Documented notes are hygiene / future-monetization / **dev-only** dependency CVEs (not in the shipped browser bundle).

**Sign-off: CLEAR** for QA and static offline distribution. Before public GitHub publish / production deploy, Olivia should acknowledge the documented **devDependencies** audit findings (or bump Vitest) per RELEASE_GATE §Required remediations.

---

## Ship blockers

**None.**

No secrets in source, no XSS sinks with untrusted HTML, no live ad/billing keys, no third-party runtime telemetry, production `npm audit --omit=dev` reports **0** vulnerabilities.

---

## Findings

### F1 — XSS / DOM sinks — PASS (informational)

| Severity | Info |
|----------|------|
| Evidence | `src/main.ts:174`, `src/main.ts:182`, `src/main.ts:212–215`, and other `textContent` assignments |

- `gridEl.innerHTML = ''` and `ul.innerHTML = ''` are **clear-only** (empty string). No untrusted HTML assigned.
- Grid letters and word-list entries use `document.createElement` + **`textContent`** (not HTML interpolation).
- HUD, timers, hint toast, share copy, mute labels all use `textContent`.
- No `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, or React `dangerouslySetInnerHTML` equivalents anywhere in `src/` / `index.html`.
- Placer additionally strips non-letters: `toUpperCase().replace(/[^A-Z]/g, '')` (`src/puzzle/placer.ts:95`, `:154`) before placement — defense in depth if a word bank entry were ever polluted.

**Fix:** None required.

### F2 — Word bank content — PASS (informational)

| Severity | Info |
|----------|------|
| Evidence | `public/words/en-clean.json` (299 words: Animals 99 / Food 100 / Travel 100) |

- Sampled all entries: letters/`'`/`-` only; **0** hits for `<`, `>`, `script`, `javascript:`, event handlers, template injection, URLs, or other executable/script-like payloads.
- Scrubbing note in JSON documents family-safe curation (product content policy — not a security executable-payload issue).
- Loaded via same-origin `fetch('/words/en-clean.json')` (`src/puzzle/words.ts:35–38`); rendered only via `textContent`.

**Fix:** None required for security. Offensive-language scrubbing remains a product QA note, not a release blocker.

### F3 — Secrets / monetization stubs — PASS

| Severity | Info |
|----------|------|
| Evidence | `src/ads/stubs.ts` (entire file); grep for keys/tokens |

- Stubs only: `showBanner` / `showInterstitial` / `showRewarded` / `rewardedHint` / `purchaseRemoveAds` log via `console.debug` and flip local `adsRemoved` — **no AdMob SDK, no Play Billing, no API keys**.
- Grep for `api_key`, `AIza`, `sk_live`, `Bearer`, private keys, AdMob app IDs, etc. across `src/`, `public/`, configs: **no matches** (aside from stub comments mentioning AdMob/Billing as future wiring).
- No `.env` files present in the project tree.

**Fix:** None for MVP. When live ads/IAP land, secrets must stay in env / secret store only.

### F4 — Persistence / localStorage — PASS (notes)

| Severity | Info / Low note |
|----------|-----------------|
| Evidence | `src/game/persist.ts` |

- Prefix `wordhunt:v1:` — keys: `gamesPlayed`, `wordsFoundTotal`, `settings`, `daily:YYYY-MM-DD`.
- Stores only counters and `{ muted, adsRemoved }` / daily completion metadata — **no credentials or tokens**.
- `JSON.parse` on settings uses only `Boolean(parsed.muted)` / `Boolean(parsed.adsRemoved)` — prototype pollution not applicable in practice.
- `dailyKey` comes from `dailyKeyKarachi()` (`YYYY-MM-DD`), not free-form user HTML (`src/puzzle/rng.ts:34–41`, `src/main.ts:122–126`).
- Quota / privacy-mode failures caught and ignored.

**Fix:** None required.

### F5 — PWA / service worker — PASS (notes)

| Severity | Info |
|----------|------|
| Evidence | `vite.config.ts:5–20`; `dist/sw.js`; `public/manifest.webmanifest`; `src/main.ts:426–436` |

- `VitePWA`: `registerType: 'autoUpdate'`, `manifest: false` (static `public/manifest.webmanifest`), Workbox `globPatterns` for local static types, `devOptions.enabled: false`.
- Built `dist/sw.js`: `skipWaiting`, `clientsClaim`, `precacheAndRoute` of **same-origin** assets only (HTML/JS/CSS/icons/words JSON/manifest), `cleanupOutdatedCaches`, `NavigationRoute` → `index.html` (expected SPA offline fallback). **No external precache URLs.**
- Manifest: `start_url: "/"`, `display: standalone`, local icons only — no remote resources.
- Registration via `virtual:pwa-register` with `immediate: true` — standard auto-update; not a hijack pattern.
- `workbox-google-analytics` appears in the **lockfile** as a transitive Workbox package but is **not imported or registered** in the built SW (no analytics collect/gtag routes).

**Notes (non-blocking):** Confirm hosting serves SW with correct `Service-Worker-Allowed` / scope `/` and does not inject third-party scripts. Optional future: `navigateFallbackDenylist` if non-SPA routes are added.

### F6 — Network / telemetry / offline-only — PASS

| Severity | Info |
|----------|------|
| Evidence | `src/puzzle/words.ts:36`; `src/main.ts`; `dist/index.html`; greps |

- Application `fetch` only for same-origin word bank JSON.
- No `XMLHttpRequest`, `sendBeacon`, analytics SDKs, `gtag`, AdMob, DoubleClick, Sentry, etc. in app source or built `index.html` (only self-hosted module/CSS).
- Share uses `navigator.share` / `clipboard.writeText` with locally composed plain text — user-initiated, no telemetry endpoint.
- Ads stubs do not perform network I/O.

**Fix:** None required.

### F7 — Dependency audit — PASS_WITH_NOTES (dev-only CVEs)

| Severity | Notes (dev tooling) |
|----------|---------------------|
| Evidence | `package.json` (devDependencies only; **no** `dependencies`); `npm audit`; `npm audit --omit=dev` → **0 vulnerabilities** |

| Package / chain | Reported severity | Runtime impact |
|-----------------|-------------------|----------------|
| `vitest@2.1.9` (+ `@vitest/mocker`, nested `vite@5.4.21`, `vite-node`, nested `esbuild`) | critical / high / moderate | **Dev/test only** — not shipped in `dist/` |
| Top-level `vite@8.3.1` (app build) | Not the vulnerable `vite <=6.4.2` range called out for nested vitest copies | Build tooling; output is static files |
| Production install (`--omit=dev`) | **0** vulns | N/A |

Notable advisories (do not affect offline PWA users of `dist/`):

- Vitest UI / mocker arbitrary file read-exec (GHSA-5xrq-8626-4rwp) — requires Vitest UI server  
- Nested Vite/esbuild dev-server issues (path traversal, esbuild request proxy) — local `npm run dev` / test harness  

**Recommended (non-blocking for this MVP QA):**

1. Olivia **risk-accepts** these as build/test-time only for v0.1.0 offline ship, **or**  
2. Before public GitHub publish, bump `vitest` to a fixed major (audit suggests 5.x — breaking) and re-run `npm audit`.

Per RELEASE_GATE: critical/high must be clean **or** documented risk acceptance — this section is that documentation for Olivia.

### F8 — `.gitignore` secrets hygiene — NOTE

| Severity | Low |
|----------|-----|
| Evidence | `.gitignore` — has `node_modules`, `dist`, `*.local`; **no** `.env` / `.env.*` / `*.pem` patterns |

No secrets committed today. When AdMob / billing keys arrive, add `.env*` (and keep `.env.example` placeholders only) before any commit.

**Fix (process, not product code this review):** Extend `.gitignore` when monetization lands. Not a ship blocker for stub-only MVP.

### F9 — Authn / authz / uploads / admin — N/A

No accounts, sessions, APIs, uploads, admin, or privileged routes. CORS/CSRF N/A. Logging limited to `console.debug` stub messages — no tokens/PII.

---

## Release-gate checklist

| # | Item | Result |
|---|------|--------|
| 1 | Authn / sessions / tokens | N/A (no accounts) |
| 2 | Authz / IDOR / roles | N/A |
| 3 | Secrets & config | PASS — stubs only; no keys |
| 4 | API surface & rate limits | N/A (static client) |
| 5 | Injection (XSS / etc.) | PASS — `textContent`; clear-only `innerHTML` |
| 6 | Uploads & file access | N/A |
| 7 | Dependencies & supply chain | PASS_WITH_NOTES — prod 0; document vitest/dev CVEs |
| 8 | Logging / error leakage | PASS — debug stubs only |
| 9 | Transport (TLS / cookies / HSTS) | Deploy-time (static host); app sets no insecure cookies |
| 10 | Admin / debug surfaces | PASS — no debug endpoints |

Master focus mapping: XSS ✓ · Unsafe HTML ✓ · Secrets ✓ · PWA/SW ✓ · Offline/telemetry ✓ · Deps ✓

---

## Tests run during review

```text
npm test     → 9/9 passed (Vitest)
npm audit --omit=dev → 0 vulnerabilities
npm audit (all)      → 5 issues (3 moderate, 1 high, 1 critical) — all via vitest/dev chain
```

No product code was modified. No `git push` performed.

---

## Notes for Product / Engineer (non-blocking)

1. Prefer keeping `innerHTML` clear-only; continue `textContent` for any future dynamic strings.  
2. Before live ads: env-only keys, extend `.gitignore` for `.env*`, never commit AdMob/IAP secrets.  
3. Optionally add CSP at the static host (`default-src 'self'`; tighten as needed) when publishing.  
4. Transitive `workbox-google-analytics` in lockfile is unused — no action unless enabling GA offline queue (do not for privacy-preserving offline MVP).  
5. Olivia: acknowledge F7 risk acceptance or schedule Vitest bump before GitHub Manager publish.

---

## Sign-off

| Item | Value |
|------|--------|
| **Verdict** | PASS_WITH_NOTES |
| **Ship blockers** | None |
| **Sign-off** | **CLEAR** |
| **Report path** | `/workspace/factory/projects/wordhunt-offline/SECURITY-REPORT.md` |

Reviewed against Master focus + `/workspace/factory/shared/security/RELEASE_GATE.md`. Ready for QA continuation; GitHub/production publish contingent on Olivia’s acceptance of documented dev-only audit items (or a Vitest upgrade).
