// v0.2 meta + ad-placement unit tests (plain node): challenge seeding, achievements, shop CSS, ad rules, policy words.
import assert from 'node:assert/strict';
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const R = p => path.join(path.dirname(new URL(import.meta.url).pathname), '..', p);
// public/js files are classic scripts with a CommonJS export; load them in a sandbox (package is type: module)
function load(f) { const module = { exports: {} }; vm.runInNewContext(fs.readFileSync(R(f), 'utf8'), { module, exports: module.exports, globalThis: {}, console, Date, Math, JSON }); return module.exports; }
const ML = load('public/js/metakit.js');
const DailyLogic = load('public/js/daily.js');
const G = load('public/js/adgate.js');
const ctx = { window: { ACH_DEFS: [], Meta: { init() {} } } };
vm.runInNewContext(fs.readFileSync(R('public/js/meta-config.js'), 'utf8'), ctx);
ctx.window.__wh = { showScreen() {} }; ctx.window.WH_META_BOOT();
const C = ctx.window.WH_META;
assert.ok(C && C.challenges.length >= 5);
const ids = new Set(); for (let d = 1; d <= 30; d++) ids.add(ML.challengeFor('2026-11-' + String(d).padStart(2, '0'), C.challenges, C.salt).id);
assert.ok(ids.size >= 3, 'challenge rotates');
const by = Object.fromEntries(C.challenges.map(c => [c.id, c]));
assert.equal(by.daily.test({ daily: true }), true); assert.equal(by.daily.test({ daily: false }), false);
assert.equal(by.quick.test({ ms: 179999 }), true); assert.equal(by.quick.test({ ms: 180000 }), false);
assert.equal(ML.winCoins({ stars: 3, clean: true }), 30);
assert.equal(DailyLogic.REWARDS.length, 7);
const actx = { window: {} }; vm.runInNewContext(fs.readFileSync(R('public/js/ach-defs.js'), 'utf8'), actx);
const defs = actx.window.ACH_DEFS; assert.equal(new Set(defs.map(d => d.id)).size, defs.length);
defs.forEach(d => assert.ok(d.goal > 0 && d.reward > 0 && d.reward <= 250));
const css = fs.readFileSync(R('public/css/meta.css'), 'utf8');
C.shop.forEach(g => { assert.equal(g.items[0].price, 0); g.items.slice(1).forEach(it => assert.ok(css.includes('body.' + g.prefix + it.id), 'css for ' + g.prefix + it.id)); });
// ad gate
function mem() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; }
const g = G.make(mem()); g.startSession(); for (let i = 0; i < 9; i++) g.levelDone(); assert.equal(g.allow(), false); g.startSession(); assert.equal(g.allow(), true);
// ad placement in main.ts
const main = fs.readFileSync(R('src/main.ts'), 'utf8');
assert.equal((main.match(/showInterstitialAfterPuzzle\(/g) || []).length, 1, 'one interstitial call site');
assert.equal((main.match(/afterPuzzleAd\(\);/g) || []).length, 2, 'only from the two win-card buttons');
for (const fn of ['function startEndless', 'function startDaily', 'async function boot', 'function onWin']) {
  const i = main.indexOf(fn); const body = main.slice(i, main.indexOf('\n}\n', i));
  assert.ok(!/showInterstitial/.test(body), 'no interstitial in ' + fn);
}
assert.ok(!/purchaseRemoveAds|iap\./.test(main), 'no fake purchase');
// policy words
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').toLowerCase();
const ui = ['index.html', 'public/js/metakit.js', 'public/js/meta-config.js', 'public/js/ach-defs.js', 'src/main.ts'].map(f => strip(fs.readFileSync(R(f), 'utf8'))).join('\n');
['withdraw', 'paypal', 'real money', 'loot box', 'lootbox', 'wager', 'gamble', 'buy coins', '(stub)', 'remove ads'].forEach(w => assert.ok(!ui.includes(w), 'policy word: ' + w));
console.log('ALL META TESTS PASSED');
