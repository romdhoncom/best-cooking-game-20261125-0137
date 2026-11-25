// Dapur Kilat — the game itself: state, loop, interaction, and the HUD.
// The cook works one order at a time (the oldest open order on the board):
// take its ingredients from the crates, chop at the talenan, cook at the
// wajan or panggangan, assemble on the piring, serve at the jendela —
// before the order's timer runs out. A 3-minute shift, 3 hearts.

import { makeCook, moveCook, nearestStation, stationAtPoint, approachPoint, stationLabel } from './kitchen.js';
import { INGREDIENTS, RECIPES } from './recipes.js';
import { MAX_ORDERS, ORDER_TIME, makeOrder, activeOrder, updateOrders, serveReward, makeRng } from './orders.js';
import { makeInput } from './input.js';
import { drawGame } from './render.js';
import { sfx, toggleMute, startSizzle, stopSizzle } from './audio.js';
import { setupShot } from './shots.js';

const SHIFT_SECONDS = 180;
const CARRY_MAX = 3;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  phase: 'title',
  cook: makeCook(),
  orders: [],
  carry: [],
  plated: null,
  work: null,
  particles: [],
  coins: 0,
  score: 0,
  hearts: 3,
  combo: 0,
  bestCombo: 0,
  served: 0,
  failed: 0,
  shiftLeft: SHIFT_SECONDS,
  spawnIn: 6,
  nextOrderId: 1,
  lastServed: null,
  near: null,
  nearHint: '',
  hint: '',
  hintUntil: 0,
  rng: Math.random,
  walkTarget: null,
  walkInteract: null,
  summary: null,
};

function flashHint(text) {
  game.hint = text;
  game.hintUntil = performance.now() + 1800;
}

game.spawnSteam = function spawnSteam(x, y, n) {
  for (let i = 0; i < n; i++) {
    game.particles.push({
      kind: 'steam', x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 16,
      r: 5 + Math.random() * 7, life: 0.9, max: 0.9, vy: -28,
    });
  }
};

function startShift() {
  game.phase = 'play';
  game.cook = makeCook();
  game.orders = [makeOrder(game.rng, game.nextOrderId++)];
  game.carry = [];
  game.plated = null;
  game.work = null;
  game.particles = [];
  game.coins = 0;
  game.score = 0;
  game.hearts = 3;
  game.combo = 0;
  game.bestCombo = 0;
  game.served = 0;
  game.failed = 0;
  game.shiftLeft = SHIFT_SECONDS;
  game.spawnIn = 12;
  game.lastServed = null;
  game.summary = null;
  game.walkTarget = null;
  game.walkInteract = null;
  flashHint('Shift dimulai! Pesanan pertama sudah masuk.');
}

function endShift() {
  game.phase = 'over';
  stopSizzle();
  game.summary = {
    served: game.served, coins: game.coins, score: game.score,
    bestCombo: game.bestCombo, failed: game.failed,
  };
}

// What the active order needs right now.
function currentNeed() {
  const order = activeOrder(game.orders);
  if (!order) return null;
  return order.recipe.steps[order.step] || null;
}

function tryInteract(st) {
  if (!st || game.phase !== 'play' || game.work) return;
  const order = activeOrder(game.orders);
  if (!order) { flashHint('Belum ada pesanan — tunggu sebentar.'); return; }
  const need = order.recipe.steps[order.step];
  if (!need) return;

  if (st.kind === 'crate') {
    if (need.kind !== 'take' || need.ingredient !== st.ingredient) {
      flashHint(`Pesanan ini butuh: ${need.kind === 'take' ? INGREDIENTS[need.ingredient].name : need.label}`);
      sfx.tick();
      return;
    }
    if (game.carry.length >= CARRY_MAX) { flashHint('Tangan penuh!'); return; }
    game.carry.push(st.ingredient);
    order.step += 1;
    sfx.pickup();
    return;
  }

  const use = st.use;
  if (need.kind === 'chop' && need.station === use) {
    game.work = { station: use, label: need.label, left: need.seconds, total: need.seconds };
    return;
  }
  if (need.kind === 'cook' && need.station === use) {
    game.work = { station: use, label: need.label, left: need.seconds, total: need.seconds };
    startSizzle();
    return;
  }
  if (need.kind === 'assemble' && need.station === use) {
    game.work = { station: use, label: need.label, left: need.seconds, total: need.seconds };
    return;
  }
  if (need.kind === 'serve' && use === 'jendela') {
    if (game.plated !== order.recipe.id) { flashHint('Susun dulu hidangannya di piring!'); return; }
    const reward = serveReward(order, game.combo);
    game.coins += reward;
    game.score += reward;
    game.combo += 1;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    game.served += 1;
    game.lastServed = order.recipe.name;
    order.state = 'done';
    game.plated = null;
    game.carry = [];
    game.particles.push({ kind: 'coin', text: `+${reward}`, x: st.x + st.w / 2, y: st.y - 10, life: 1.1, max: 1.1 });
    for (let i = 0; i < 6; i++) {
      game.particles.push({ kind: 'spark', x: st.x + 20 + Math.random() * (st.w - 40), y: st.y + 20 + Math.random() * 40, life: 0.6, max: 0.6 });
    }
    sfx.serve();
    return;
  }
  flashHint(`Langkah ini: ${need.label} — bukan di ${stationLabel(st)}`);
  sfx.tick();
}

function finishWork() {
  const w = game.work;
  const order = activeOrder(game.orders);
  game.work = null;
  stopSizzle();
  if (!order) return;
  const need = order.recipe.steps[order.step];
  if (!need) return;
  if (need.kind === 'chop') sfx.chop();
  else if (need.kind === 'cook') {
    // A cooked dish lands on a plate, ready to serve: the wok is the last
    // step before the window for fried dishes (no separate assembly).
    sfx.cook();
    game.plated = order.recipe.id;
    game.carry = [];
  } else if (need.kind === 'assemble') {
    sfx.assemble();
    game.plated = order.recipe.id;
    game.carry = [];
  }
  order.step += 1;
}

function update(dt) {
  if (game.phase !== 'play') return;

  // Shift clock and order spawning.
  game.shiftLeft -= dt;
  if (game.shiftLeft <= 0) { game.shiftLeft = 0; endShift(); return; }
  game.spawnIn -= dt;
  if (game.spawnIn <= 0) {
    game.spawnIn = 12 + game.rng() * 5;
    const open = game.orders.filter((o) => o.state === 'open').length;
    if (open < MAX_ORDERS) {
      const last = game.orders[game.orders.length - 1];
      game.orders.push(makeOrder(game.rng, game.nextOrderId++, last ? last.recipe.id : null));
    }
  }

  // Work in progress locks the cook in place.
  if (game.work) {
    game.work.left -= dt;
    if (game.work.station === 'wajan' || game.work.station === 'panggangan') {
      if (Math.random() < dt * 6) game.spawnSteam(game.cook.x, game.cook.y - 30, 1);
    }
    if (game.work.left <= 0) finishWork();
    return;
  }

  // Movement: keys win over a mouse walk target.
  const input = game.input;
  const dir = input.dir();
  if (dir.x !== 0 || dir.y !== 0) {
    game.walkTarget = null;
    game.walkInteract = null;
    moveCook(game.cook, dir.x, dir.y, dt);
  } else if (game.walkTarget) {
    const dx = game.walkTarget.x - game.cook.x;
    const dy = game.walkTarget.y - game.cook.y;
    const d = Math.hypot(dx, dy);
    if (d < 12) {
      game.walkTarget = null;
      if (game.walkInteract) {
        const st = game.walkInteract;
        game.walkInteract = null;
        tryInteract(st);
      }
    } else {
      moveCook(game.cook, dx / d, dy / d, dt);
    }
  }

  // Nearest station + its hint.
  game.near = nearestStation(game.cook);
  if (game.near) {
    const need = currentNeed();
    game.nearHint = need ? `${stationLabel(game.near)} — ${need.label}` : stationLabel(game.near);
  } else {
    game.nearHint = '';
  }

  // Interact key.
  if (input.consumeInteract() && game.near) tryInteract(game.near);

  // Order timers.
  updateOrders(game.orders, dt, (o) => {
    game.hearts -= 1;
    game.failed += 1;
    game.combo = 0;
    sfx.fail();
    flashHint(`Pesanan ${o.recipe.name} hangus! -1 hati`);
    if (game.hearts <= 0) endShift();
  });

  // Particles.
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.life -= dt;
    if (p.kind === 'steam') p.y += (p.vy || -28) * dt;
    if (p.kind === 'coin') p.y -= 40 * dt;
    if (p.life <= 0) game.particles.splice(i, 1);
  }
}

// ---- HUD (DOM) ----
const el = {
  clock: document.getElementById('shift-clock'),
  coins: document.getElementById('coins'),
  score: document.getElementById('score-num'),
  hearts: document.getElementById('hearts'),
  orders: document.getElementById('orders'),
  carry: document.getElementById('carry-items'),
};

function fmtClock(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, '0')}`;
}

function renderHud() {
  el.clock.textContent = fmtClock(Math.max(0, game.shiftLeft));
  el.clock.style.color = game.shiftLeft < 30 ? '#ff6b5e' : '';
  el.coins.textContent = game.coins;
  el.score.textContent = game.score;
  el.hearts.textContent = '❤'.repeat(Math.max(0, game.hearts)) + '♡'.repeat(Math.max(0, 3 - game.hearts));
  const hint = game.hint && performance.now() < game.hintUntil ? game.hint : '';
  el.carry.innerHTML = game.carry.length
    ? game.carry.map((id) => INGREDIENTS[id].name).join(' · ')
    : (hint || '— kosong —');
  el.orders.innerHTML = game.orders.map((o) => {
    const pct = Math.max(0, (o.timeLeft / o.timeMax) * 100);
    const low = pct < 35 ? 'low' : '';
    const cls = o.state === 'done' ? 'done' : o.state === 'failed' ? 'failed' : '';
    const steps = o.recipe.steps.slice(o.step).map((s) => s.label).join(' → ') || 'Selesai!';
    return `<div class="order ${cls}">
      <div class="dish">${o.recipe.name} · ${o.recipe.price} koin</div>
      <div class="steps">${steps}</div>
      <div class="timerbar"><i class="${low}" style="width:${pct}%"></i></div>
    </div>`;
  }).join('') || '<div class="order"><div class="dish">Belum ada pesanan</div></div>';
}

// ---- Input hooks ----
game.input = makeInput(canvas, {
  onMute() {
    const m = toggleMute();
    flashHint(m ? 'Suara mati' : 'Suara hidup');
  },
  onRestart() {
    if (game.phase === 'over' || game.phase === 'play') startShift();
  },
  onPause() {
    if (game.phase === 'play') { game.phase = 'pause'; stopSizzle(); }
    else if (game.phase === 'pause') game.phase = 'play';
  },
  onConfirm() {
    if (game.phase === 'title') startShift();
  },
  onClick(x, y) {
    if (game.phase !== 'play' || game.work) return;
    const st = stationAtPoint(x, y);
    if (!st || st.kind === 'menu') return;
    // Walk to the station's approach point, then interact.
    const ap = approachPoint(st);
    game.walkTarget = { x: ap.x, y: ap.y };
    game.walkInteract = st;
  },
});

// ---- Screenshot mode ----
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  setupShot(game, shot, Number(params.get('seed') || 7));
}

// ---- Main loop ----
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  drawGame(ctx, game);
  renderHud();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// For the shot driver and debugging.
window.__game = game;
