// Dapur Kilat — orders: the order board, spawning, timers, and rewards.
// Orders arrive over the shift, each with a dish, a step counter and a
// countdown. Serving the right dish in time pays coins and builds a combo;
// letting one expire costs a heart.

import { RECIPE_LIST } from './recipes.js';

export const MAX_ORDERS = 3;
export const ORDER_TIME = 45; // seconds an order stays on the board

// Deterministic pick for screenshots; random otherwise.
export function pickRecipe(rng, avoidId = null) {
  const pool = RECIPE_LIST.filter((r) => r.id !== avoidId);
  return pool[Math.floor(rng() * pool.length)];
}

export function makeOrder(rng, id, avoidId = null) {
  const recipe = pickRecipe(rng, avoidId);
  return {
    id, recipe, step: 0, timeLeft: ORDER_TIME, timeMax: ORDER_TIME,
    state: 'open', // open | done | failed
  };
}

// The active order the cook is working on: the oldest open one whose next
// step the cook can actually do. For simplicity the cook works the first
// open order on the board; the board lists them oldest first.
export function activeOrder(orders) {
  return orders.find((o) => o.state === 'open') || null;
}

export function updateOrders(orders, dt, onExpire) {
  for (const o of orders) {
    if (o.state !== 'open') continue;
    o.timeLeft -= dt;
    if (o.timeLeft <= 0) {
      o.timeLeft = 0;
      o.state = 'failed';
      onExpire(o);
    }
  }
  // Drop finished orders after a short beat so the board reads clearly.
  for (let i = orders.length - 1; i >= 0; i--) {
    if (orders[i].state !== 'open') {
      orders[i].goneIn = (orders[i].goneIn ?? 1.2) - dt;
      if (orders[i].goneIn <= 0) orders.splice(i, 1);
    }
  }
}

// Coins for a serve: dish price, plus a speed bonus, times the combo.
export function serveReward(order, combo) {
  const speedBonus = order.timeLeft > order.timeMax * 0.5 ? 5 : 0;
  const mult = 1 + Math.min(combo, 5) * 0.1;
  return Math.round((order.recipe.price + speedBonus) * mult);
}

// Small seeded RNG (mulberry32) so screenshots are reproducible.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
