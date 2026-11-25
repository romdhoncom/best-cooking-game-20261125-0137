// Dapur Kilat — screenshot scenes: deterministic setups so each screenshot
// shows the game at its best. ?shot=cover|mid|serve|end&seed=N
// cover: title screen over a busy kitchen with orders on the board.
// mid:   a dish mid-assembly — the cook at the plating counter, ingredients
//        in hand, one order half done, wok steaming.
// serve: a finished plate at the serving window, coins popping.
// end:   the shift-over summary screen.

import { makeOrder, makeRng } from './orders.js';
import { RECIPES } from './recipes.js';

export function setupShot(game, name, seed) {
  const rng = makeRng(seed || 7);
  game.rng = rng;
  if (name === 'cover') {
    game.phase = 'title';
    const o1 = makeOrder(rng, 1);
    const o2 = makeOrder(rng, 2, o1.recipe.id);
    const o3 = makeOrder(rng, 3, o2.recipe.id);
    game.orders = [o1, o2, o3];
    game.orders[0].timeLeft = 38;
    game.orders[1].timeLeft = 27;
    game.orders[2].timeLeft = 18;
    game.cook.x = 640;
    game.cook.y = 400;
    game.carry = ['nasi', 'telur'];
    game.plated = null;
    game.spawnSteam(1120 + 65, 240 + 40, 6);
  } else if (name === 'mid') {
    game.phase = 'play';
    game.orders = [makeOrder(rng, 1)];
    game.orders[0].recipe = RECIPES.miegor;
    game.orders[0].step = 4; // about to cook
    game.orders[0].timeLeft = 24;
    game.cook.x = 1050;
    game.cook.y = 330;
    game.cook.face = 'right';
    game.carry = ['mie', 'ayam', 'sayur'];
    game.plated = null;
    game.work = { station: 'wajan', label: 'Goreng di Wajan', left: 1.4, total: 3 };
    game.spawnSteam(1120 + 65, 240 + 40, 8);
  } else if (name === 'serve') {
    game.phase = 'play';
    game.orders = [makeOrder(rng, 1)];
    game.orders[0].recipe = RECIPES.nasgor;
    game.orders[0].step = 4;
    game.orders[0].timeLeft = 31;
    // Keep the order open: a 'done' order is swept off the board 1.2 s in,
    // so the screenshot would show an empty board instead of the order.
    game.cook.x = 1080;
    game.cook.y = 590;
    game.cook.face = 'right';
    game.carry = [];
    game.plated = 'nasgor';
    game.lastServed = 'Nasi Goreng';
    game.coins = 75;
    game.score = 120;
    game.particles.push({ kind: 'coin', text: '+25', x: 1100, y: 620, life: 3, max: 3 });
    game.spawnSteam(1120 + 65, 240 + 40, 4);
  } else if (name === 'end') {
    game.phase = 'over';
    game.summary = { served: 11, coins: 268, score: 412, bestCombo: 4, failed: 1 };
    game.orders = [];
    game.carry = [];
    game.plated = null;
  }
}
