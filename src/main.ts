import './style.css';
import {
  loadWordBank,
  allWords,
  wordsForCategory,
  type WordBank,
  generatePuzzle,
  dailyKeyKarachi,
  createDailyRng,
  createEndlessRng,
  mulberry32,
  hashStringToUint32,
} from './puzzle';
import {
  createSession,
  trySelect,
  isWin,
  foundCount,
  totalWords,
  applyHint,
  elapsedSeconds,
  type SessionState,
} from './game/session';
import {
  getGamesPlayed,
  getWordsFoundTotal,
  incrementGamesPlayed,
  addWordsFoundTotal,
  getSettings,
  setSettings,
  getDailyRecord,
  saveDailyRecord,
} from './game/persist';
import { ads, iap } from './ads/stubs';
import type { Cell } from './puzzle/path';

type Screen = 'home' | 'howto' | 'play';

let bank: WordBank | null = null;
let session: SessionState | null = null;
let lastMode: 'endless' | 'daily' = 'endless';
let lastCategory = 'Animals';
let selecting = false;
let path: Cell[] = [];
let timerId: number | null = null;
let wonHandled = false;

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

function showScreen(name: Screen): void {
  document.querySelectorAll<HTMLElement>('.screen').forEach((el) => {
    el.hidden = el.dataset.screen !== name;
  });
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function refreshHome(): void {
  $('#home-games').textContent = String(getGamesPlayed());
  $('#home-words').textContent = String(getWordsFoundTotal());
  const key = dailyKeyKarachi();
  const rec = getDailyRecord(key);
  const meta = $('#daily-meta');
  meta.textContent = rec?.completed
    ? `Daily ${key} ✓ completed`
    : `Daily ${key} ready`;
  syncMuteButtons();
  const s = getSettings();
  const removeBtn = $('#btn-remove-ads') as HTMLButtonElement;
  removeBtn.textContent = s.adsRemoved ? 'Ads removed ✓' : 'Remove ads';
  removeBtn.disabled = s.adsRemoved;
}

function syncMuteButtons(): void {
  const muted = getSettings().muted;
  const label = muted ? '🔇 Muted' : '🔊 Sound';
  $('#btn-mute-home').textContent = label;
  const playMute = document.getElementById('btn-mute');
  if (playMute) playMute.textContent = muted ? '🔇' : '🔊';
}

function toggleMute(): void {
  const s = getSettings();
  setSettings({ ...s, muted: !s.muted });
  syncMuteButtons();
}

function vibrate(ms = 12): void {
  if (getSettings().muted) return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

function categoryBank(): string[] {
  if (!bank) return [];
  const sel = ($('#category-select') as HTMLSelectElement).value;
  lastCategory = sel;
  if (sel === 'All') return allWords(bank);
  return wordsForCategory(bank, sel);
}

function startEndless(): void {
  ads.showInterstitial();
  const words = categoryBank();
  const puzzle = generatePuzzle(words, createEndlessRng(), { size: 10, count: 8 });
  session = createSession(puzzle, { mode: 'endless', category: lastCategory });
  lastMode = 'endless';
  wonHandled = false;
  incrementGamesPlayed();
  mountPlay();
}

function startDaily(): void {
  ads.showInterstitial();
  const key = dailyKeyKarachi();
  const words = bank ? allWords(bank) : [];
  const rng = createDailyRng(key);
  const puzzle = generatePuzzle(words, rng, { size: 10, count: 8 });
  session = createSession(puzzle, { mode: 'daily', category: 'Daily', dailyKey: key });
  lastMode = 'daily';
  wonHandled = false;
  incrementGamesPlayed();
  mountPlay();
}

function mountPlay(): void {
  if (!session) return;
  showScreen('play');
  ($('[data-mode]') as HTMLElement).textContent =
    session.mode === 'daily' ? 'Daily' : session.category;
  renderGrid();
  renderWordList();
  updateHud();
  $('#win').hidden = true;
  $('#hint-toast').hidden = true;
  startTimer();
  syncMuteButtons();
}

function startTimer(): void {
  stopTimer();
  timerId = window.setInterval(() => {
    if (!session || isWin(session)) return;
    updateHud();
  }, 500);
}

function stopTimer(): void {
  if (timerId != null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function updateHud(): void {
  if (!session) return;
  ($('[data-found]') as HTMLElement).textContent =
    `${foundCount(session)}/${totalWords(session)}`;
  ($('[data-timer]') as HTMLElement).textContent = formatTime(elapsedSeconds(session));
}

function renderGrid(): void {
  if (!session) return;
  const gridEl = $('#grid');
  const size = session.puzzle.size;
  gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gridEl.innerHTML = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);
      cell.role = 'gridcell';
      cell.textContent = session.puzzle.grid[r]![c]!;
      gridEl.appendChild(cell);
    }
  }
  paintCells();
  bindGridInput(gridEl);
}


function paintCells(): void {
  if (!session) return;
  const foundCells = new Set<string>();
  for (const p of session.puzzle.placed) {
    if (!session.found.has(p.word)) continue;
    for (const { r, c } of p.cells) foundCells.add(`${r},${c}`);
  }
  const pathSet = new Set(path.map((p) => `${p.r},${p.c}`));
  document.querySelectorAll<HTMLElement>('.cell').forEach((el) => {
    const r = Number(el.dataset.r);
    const c = Number(el.dataset.c);
    const key = `${r},${c}`;
    el.classList.toggle('found', foundCells.has(key));
    el.classList.toggle('selecting', pathSet.has(key));
    el.classList.toggle('hinted', session!.hintedCells.has(key) && !foundCells.has(key));
  });
}

function renderWordList(): void {
  if (!session) return;
  const ul = $('#word-list');
  ul.innerHTML = '';
  for (const w of session.puzzle.words) {
    const li = document.createElement('li');
    li.textContent = w;
    if (session.found.has(w)) li.classList.add('found');
    ul.appendChild(li);
  }
}

function cellFromPoint(clientX: number, clientY: number): Cell | null {
  const el = document.elementFromPoint(clientX, clientY);
  if (!(el instanceof HTMLElement) || !el.classList.contains('cell')) return null;
  return { r: Number(el.dataset.r), c: Number(el.dataset.c) };
}

function sameCell(a: Cell, b: Cell): boolean {
  return a.r === b.r && a.c === b.c;
}

function extendPath(cell: Cell): void {
  if (path.length === 0) {
    path = [cell];
    paintCells();
    return;
  }
  const last = path[path.length - 1]!;
  if (sameCell(last, cell)) return;
  // allow backtrack one step
  if (path.length >= 2 && sameCell(path[path.length - 2]!, cell)) {
    path = path.slice(0, -1);
    paintCells();
    return;
  }
  if (path.some((p) => sameCell(p, cell))) return;
  const dr = cell.r - path[0]!.r;
  const dc = cell.c - path[0]!.c;
  // must stay on a straight ray from start; step from last must match unit direction
  if (path.length === 1) {
    const stepR = cell.r - last.r;
    const stepC = cell.c - last.c;
    if (Math.abs(stepR) > 1 || Math.abs(stepC) > 1 || (stepR === 0 && stepC === 0)) return;
    // also require adjacency
    path = [...path, cell];
    paintCells();
    return;
  }
  const udr = Math.sign(path[1]!.r - path[0]!.r);
  const udc = Math.sign(path[1]!.c - path[0]!.c);
  if (cell.r !== last.r + udr || cell.c !== last.c + udc) return;
  // keep aligned with start direction
  if (udr !== 0 && cell.r !== path[0]!.r + udr * path.length) return;
  if (udc !== 0 && cell.c !== path[0]!.c + udc * path.length) return;
  void dr;
  void dc;
  path = [...path, cell];
  paintCells();
}

function finishSelect(): void {
  if (!session || path.length < 2) {
    path = [];
    paintCells();
    selecting = false;
    return;
  }
  const matched = trySelect(session, path);
  path = [];
  selecting = false;
  if (matched) {
    vibrate(18);
    addWordsFoundTotal(1);
    renderWordList();
    paintCells();
    updateHud();
    if (isWin(session) && !wonHandled) {
      wonHandled = true;
      onWin();
    }
  } else {
    paintCells();
  }
}

function bindGridInput(gridEl: HTMLElement): void {
  const onDown = (e: PointerEvent) => {
    if (!session || isWin(session)) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    selecting = true;
    path = [cell];
    paintCells();
    gridEl.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onMove = (e: PointerEvent) => {
    if (!selecting) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (cell) extendPath(cell);
    e.preventDefault();
  };
  const onUp = (e: PointerEvent) => {
    if (!selecting) return;
    finishSelect();
    try {
      gridEl.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  gridEl.onpointerdown = onDown;
  gridEl.onpointermove = onMove;
  gridEl.onpointerup = onUp;
  gridEl.onpointercancel = onUp;
}

function onWin(): void {
  if (!session) return;
  stopTimer();
  const sec = elapsedSeconds(session);
  ($('[data-win-found]') as HTMLElement).textContent = String(totalWords(session));
  ($('[data-win-time]') as HTMLElement).textContent = formatTime(sec);
  if (session.mode === 'daily' && session.dailyKey) {
    saveDailyRecord(session.dailyKey, {
      completed: true,
      wordsFound: foundCount(session),
      totalWords: totalWords(session),
      finishedAt: new Date().toISOString(),
    });
  }
  ads.showInterstitial();
  $('#win').hidden = false;
}

function doHint(): void {
  if (!session || isWin(session)) return;
  if (!ads.rewardedHint()) return;
  const hint = applyHint(session, mulberry32(hashStringToUint32(`hint|${Date.now()}`)));
  const toast = $('#hint-toast');
  if (!hint) {
    toast.textContent = 'No hints left';
    toast.hidden = false;
    return;
  }
  toast.textContent = `Hint: letter “${hint.letter}” revealed`;
  toast.hidden = false;
  paintCells();
  vibrate(10);
  window.setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function shareWin(): void {
  if (!session) return;
  const text = `WordHunt Offline — found ${foundCount(session)}/${totalWords(session)} in ${formatTime(elapsedSeconds(session))} (${session.mode === 'daily' ? 'Daily ' + (session.dailyKey ?? '') : session.category})`;
  if (navigator.share) {
    void navigator.share({ text }).catch(() => copyShare(text));
  } else {
    copyShare(text);
  }
}

function copyShare(text: string): void {
  void navigator.clipboard?.writeText(text);
  const toast = $('#hint-toast');
  toast.textContent = 'Copied share text';
  toast.hidden = false;
  window.setTimeout(() => {
    toast.hidden = true;
  }, 1600);
}

function retry(): void {
  if (lastMode === 'daily') startDaily();
  else startEndless();
}

async function boot(): Promise<void> {
  bank = await loadWordBank();
  $('#btn-play').addEventListener('click', () => startEndless());
  $('#btn-daily').addEventListener('click', () => startDaily());
  $('#btn-howto').addEventListener('click', () => showScreen('howto'));
  $('#btn-howto-ok').addEventListener('click', () => {
    showScreen('home');
    refreshHome();
  });
  $('#btn-mute-home').addEventListener('click', toggleMute);
  $('#btn-mute').addEventListener('click', toggleMute);
  $('#btn-remove-ads').addEventListener('click', () => {
    iap.purchaseRemoveAds();
    refreshHome();
  });
  $('#btn-home').addEventListener('click', () => {
    stopTimer();
    session = null;
    showScreen('home');
    refreshHome();
  });
  $('#btn-go-home').addEventListener('click', () => {
    stopTimer();
    session = null;
    showScreen('home');
    refreshHome();
  });
  $('#btn-retry').addEventListener('click', () => retry());
  $('#btn-share').addEventListener('click', () => shareWin());
  $('#btn-hint').addEventListener('click', () => doHint());

  showScreen('home');
  refreshHome();
  ads.showBanner();

}

async function registerSW(): Promise<void> {
  try {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: true });
  } catch {
    /* non-pwa / test */
  }
}

void boot();
void registerSW();
