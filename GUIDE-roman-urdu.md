# WordHunt Offline — Istemaal Guide (Roman Urdu)

> Factory rule: har published project mein yeh file `GUIDE-roman-urdu.md` ke naam se zaroori hai.

## 1. Yeh project kya hai?

WordHunt Offline ek **offline word-search** game hai. Letter grid par chhupi English words dhoondo. Account ki zaroorat nahi — pehli load ke baad airplane mode mein bhi chalega (PWA).

## 2. Kahan se download karein?

- Factory path: `/workspace/factory/projects/wordhunt-offline`
- Local build: `npm run build` → `dist/` folder (static host / ZIP)
- GitHub publish abhi factory brief ke mutabiq **nahi** kiya gaya

## 3. Pehle kya chahiye? (requirements)

- Node.js 20+ (dev / build ke liye)
- Modern browser (Chrome / Edge / Firefox / Safari)
- Mobile: portrait screen ~360×640+ recommended

## 4. Install + Run (step-by-step)

1. Terminal kholo aur project folder mein jao:
   ```bash
   cd /workspace/factory/projects/wordhunt-offline
   ```
2. Dependencies install:
   ```bash
   npm install
   ```
3. Dev server:
   ```bash
   npm run dev
   ```
4. Browser mein URL kholo — base path **`/wordhunt-offline/`** (usually `http://localhost:5173/wordhunt-offline/` ya Pages pe `…/wordhunt-offline/`). Site root nahi.
5. Production build:
   ```bash
   npm test
   npm run build
   npm run preview
   ```
6. Phone par: browser menu → **Add to Home Screen** (PWA install).

## 5. Demo login

Koi login / demo account nahi — seedha Play dabao.

## 6. Features — har ek kya karta hai

### Play (Endless)
- **Kahan milega:** Home → **Play**
- **Kaise use karein:** Theme (Animals / Food / Travel / All) choose karke Play.
- **Result:** Naya random grid; jitni words list mein hain, sab dhoondo.

### Daily Challenge
- **Kahan milega:** Home → **Daily Challenge**
- **Kaise use karein:** Ek tap. Seed **Asia/Karachi (UTC+5)** date se aata hai — us din sab ko same puzzle.
- **Result:** Complete hone par daily progress save (`wordhunt:v1:daily:YYYY-MM-DD`).

### Word select (drag)
- **Kahan milega:** Play screen grid
- **Kaise use karein:** Finger / mouse se seedhi line mein letters drag (8 directions).
- **Result:** Sahi word → list mein strike + highlight. Galat path ignore.

### Hint
- **Kahan milega:** Play HUD → 💡
- **Kaise use karein:** Tap. MVP mein rewarded-ad stub hamesha grant karta hai.
- **Result:** Ek unfound word ka ek letter highlight (pink outline).

### Mute
- **Kahan milega:** Home ya Play → mute button
- **Kaise use karein:** Toggle.
- **Result:** Vibration / haptic band; setting `wordhunt:v1:settings` mein save.

### Remove ads (stub)
- **Kahan milega:** Home → **Remove ads**
- **Kaise use karein:** Tap (MVP local flag only — real billing nahi).
- **Result:** `adsRemoved: true`; baad mein real IAP yahi hook use karega.

### Win overlay
- **Kahan milega:** Sab words milne ke baad
- **Kaise use karein:** Endless → **New puzzle**; Daily complete → **Play endless**; Share / Home. (Same-daily Retry nahi — awkward feel avoid.)
- **Result:** Share clipboard ya system share sheet.

### Daily streak
- **Kahan milega:** Home pe `Streak: N` (jab count ≥ 1)
- **Kaise use karein:** Har Asia/Karachi din Daily complete karo; kal complete → streak +1. Ek din miss → agla complete pe reset (sirf complete pe break, open pe nahi).
- **Result:** `wordhunt:v1:streak` `{ count, lastCompletedKey }`.

### First-run howto + A2HS
- Pehli visit pe **How to play** auto-open; **Got it** → onboarded (`wordhunt:v1:onboarded`).
- Home pe dismissible **Add to Home Screen** tip (session dismiss OK); Play pe chhupa.

### Stats
- **Kahan milega:** Home pe Games / Words counters
- **Result:** `gamesPlayed` aur `wordsFoundTotal` localStorage se.

## 7. Common masail (troubleshooting)

- **Grid khali / error:** `npm install` phir soft refresh; `public/words/en-clean.json` maujood hona chahiye.
- **Daily alag lag raha hai:** Device clock check karo; seed Karachi date use karta hai, browser timezone nahi.
- **Drag kaam nahi:** Seedhi line chahiye (diagonal OK); beech mein bend reject hota hai.
- **Offline nahi chal raha:** Pehle online load karo taake service worker cache ho, phir airplane mode.
- **Purani settings:** Browser site data clear → `wordhunt:v1:*` keys reset.

## 8. Security / privacy tips

- Koi server login / password nahi.
- Progress sirf device `localStorage` mein.
- Ads/IAP stubs hain — real payment keys is MVP mein nahi.
- Public / shared PC par sensitive data mat rakho (yeh game toh harmless hai).

## 9. Agla update

- Real rewarded ads + Play Billing remove-ads
- Zyada categories / difficulty sizes
- Optional Urdu word pack (stretch)
