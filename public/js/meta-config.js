/* WordHunt v0.2 meta wiring: how-to card, daily reward + challenge, skin shop, achievements + stats,
   first-puzzle coach, accessibility. Coins are cosmetic only: earned by playing, never sold or cashed out. */
(function () {
  'use strict';
  window.WH_META_BOOT = function () {
    var W = window.__wh;
    if (!W || !window.Meta || window.WH_META) return;
    function tileThumb(it) {
      var w = document.createElement('div'); w.className = 'tile-prev tile-' + it.id;
      'WORD'.split('').forEach(function (ch, i) { var c = document.createElement('div'); c.className = 'cell' + (i < 2 ? ' found' : ''); c.textContent = ch; w.appendChild(c); });
      return w;
    }
    function bgThumb(it) { var e = document.createElement('div'); e.className = 'bg-swatch bgx-' + it.id; return e; }
    var tt = null;
    function toast(msg, ms) {
      var t = document.getElementById('toast'); if (!t || !msg) return;
      t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, ms || 1800);
    }
    window.WH_META = {
      key: 'wordhunt.meta.v1', salt: 'wordhunt', dailyBtnId: 'btn-daily-reward', barAfter: '.home-panel .stats-line', settingsAnchor: '.settings-panel .settings-end', previewBar: false,
      toast: toast,
      rewarded: function (ok, fail) { window.Ads.showRewarded(ok); },
      closeSettings: function () { W.showScreen('home'); },
      isFirstLevel: function () { return W.isFirstGame(); },
      onA11y: function () {},
      howtoNote: 'Coins are cosmetic only: earned by playing and spent on tile styles and backdrops. They can never be bought with money or cashed out.',
      howto: [
        'Words hide in the letter grid in 8 directions: across, down, diagonal and backwards.',
        'Drag across the letters of a word (or tap a straight path) to select it.',
        'Find every word in the list to finish the puzzle. Pick a theme on the home screen.',
        'Stuck? Tap 💡 to reveal a letter. Finishing without hints earns more stars and coins.',
        'Play the Daily puzzle each day to build your streak. Everyone gets the same grid.',
        'Claim the Daily reward and finish the Daily challenge for bonus coins, then spend them in the Skin Shop.'
      ],
      coach: [
        { target: '#grid', text: 'Drag across letters in a straight line to select a hidden word.' },
        { target: '#word-list', text: 'These are the words to find. Found words get crossed off.' },
        { target: '#btn-hint', text: 'Stuck? Hint reveals one letter of a word.' },
        { target: '[data-timer]', text: 'The timer is just for fun. Take your time. Enjoy!' }
      ],
      challenges: [
        { id: 'daily', title: 'Daily Reader', desc: "Finish today's Daily puzzle", count: 1, test: function (d) { return d.daily; } },
        { id: 'three', title: 'Word Trio', desc: 'Finish 3 puzzles', count: 3, test: function () { return true; } },
        { id: 'clean', title: 'No Peeking', desc: 'Finish a puzzle without a hint', count: 1, test: function (d) { return d.clean; } },
        { id: 'quick', title: 'Quick Eyes', desc: 'Finish a puzzle in under 3 minutes', count: 1, test: function (d) { return d.ms < 180000; } },
        { id: 'allmix', title: 'Mixed Bag', desc: 'Finish 2 puzzles on the All theme', count: 2, test: function (d) { return d.all; } }
      ],
      playChallenge: function (ch) { if (ch.id === 'daily') W.startDaily(); else W.startEndless(); },
      achDefs: window.ACH_DEFS || [],
      onWinStats: function (ach, d) {
        if (d.daily) ach.bump('dailies');
        if (d.ms < 120000) ach.bump('quick');
        if (d.all) ach.bump('all_wins');
        ach.max('words_total', W.wordsFound());
      },
      stats: function (st) {
        var g = function (k) { return st.m[k] || 0; };
        var s = W.streak() || {};
        return [['Puzzles finished', String(g('wins'))], ['Words found', String(W.wordsFound())], ['Hint-free finishes', String(g('clean_wins'))],
          ['Daily puzzles', String(g('dailies'))], ['Daily streak (best)', String(s.best || s.count || 0)]];
      },
      shop: [
        { title: 'Tile styles', kind: 'tile', prefix: 'tile-', thumb: tileThumb, items: [
          { id: 'classic', name: 'Classic', price: 0 }, { id: 'paper', name: 'Paper', price: 150 },
          { id: 'round', name: 'Pebble', price: 200 }, { id: 'outline', name: 'Outline', price: 250 },
          { id: 'serif', name: 'Book Serif', price: 300 }, { id: 'mono', name: 'Typewriter', price: 350 },
          { id: 'glow', name: 'Neon Glow', price: 500 }] },
        { title: 'Backdrops', kind: 'bg', prefix: 'bgx-', thumb: bgThumb, items: [
          { id: 'none', name: 'Deep Teal', price: 0 }, { id: 'dusk', name: 'Dusk', price: 150 },
          { id: 'forest', name: 'Forest', price: 200 }, { id: 'sand', name: 'Desert Sand', price: 250 },
          { id: 'plum', name: 'Plum', price: 300 }, { id: 'slate', name: 'Calm Slate', price: 300 },
          { id: 'night', name: 'Midnight', price: 400 }] }
      ]
    };
    window.Meta.init(window.WH_META);
  };
})();
