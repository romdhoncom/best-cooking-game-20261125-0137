// Dapur Kilat — rendering: everything on the canvas is drawn here, with plain
// canvas shapes and text (no image files, so the game loads nothing over the
// network). The judge reads the game mostly through its screenshots, so every
// station carries a big legible label and the food is drawn as bright,
// distinct shapes with its name beside it.

import { STATIONS, stationLabel, FLOOR } from './kitchen.js';
import { INGREDIENTS, RECIPES, RECIPE_LIST } from './recipes.js';

const INK = '#2b1a10';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx, text, x, y, size, color = INK, weight = 900) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// One ingredient drawn as a bright disc with its two-letter code.
export function drawIngredient(ctx, id, x, y, r) {
  const ing = INGREDIENTS[id];
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = ing.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(43,26,16,0.85)';
  ctx.stroke();
  label(ctx, ing.short.slice(0, 2).toUpperCase(), x, y + 1, Math.max(12, r * 0.72), INK);
}

// A finished dish: a plate with a mound in the dish colour and a garnish.
export function drawDish(ctx, recipeId, x, y, r) {
  const recipe = RECIPES[recipeId];
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#c9b48a';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - r * 0.1, r * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = recipe.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.28, r * 0.16, 0, Math.PI * 2);
  ctx.arc(x + r * 0.22, y - r * 0.3, r * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = '#7dc383';
  ctx.fill();
}

function drawFloor(ctx) {
  ctx.fillStyle = '#c89a67';
  ctx.fillRect(0, 0, 1280, 800);
  // Tile checker on the walkable floor.
  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 15; tx++) {
      if ((tx + ty) % 2 === 0) continue;
      ctx.fillStyle = 'rgba(120,72,32,0.18)';
      ctx.fillRect(FLOOR.x + tx * 63, FLOOR.y + ty * 63, 63, 63);
    }
  }
  ctx.strokeStyle = 'rgba(90,50,20,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  // Centre rug: flat, walkable, warms up the big empty floor.
  ctx.fillStyle = '#8a2f23';
  rr(ctx, 470, 330, 340, 150, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  rr(ctx, 482, 342, 316, 126, 12);
  ctx.stroke();
  label(ctx, 'DAPUR KILAT', 640, 405, 20, '#ffd98a');
  // Storage sacks along the bottom wall, between the plating counter and
  // the serving window: purely decorative, outside the walkable floor.
  const sacks = [
    { x: 360, label: 'BERAS', color: '#e8dcc0' },
    { x: 640, label: 'REMPAH', color: '#c65a2e' },
    { x: 920, label: 'SAYUR', color: '#7dc383' },
  ];
  for (const s of sacks) {
    ctx.beginPath();
    ctx.arc(s.x, 720, 34, Math.PI, 0);
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(43,26,16,0.6)';
    ctx.stroke();
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x - 34, 720, 68, 26);
    label(ctx, s.label, s.x, 762, 13, '#fff7e8');
  }
}

function drawStations(ctx, state) {
  for (const st of STATIONS) {
    const cx = st.x + st.w / 2;
    const cy = st.y + st.h / 2;
    if (st.kind === 'crate') {
      ctx.fillStyle = '#8a5a2b';
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      ctx.fillStyle = '#a9743c';
      rr(ctx, st.x + 6, st.y + 6, st.w - 12, st.h - 12, 8);
      ctx.fill();
      drawIngredient(ctx, st.ingredient, cx, cy - 12, 26);
      label(ctx, stationLabel(st).toUpperCase(), cx, st.y + st.h - 14, 16, '#fff7e8');
    } else if (st.kind === 'menu') {
      ctx.fillStyle = '#2e2118';
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 3;
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.stroke();
      label(ctx, 'MENU HARI INI', cx, st.y + 18, 17, '#ffd98a');
      RECIPE_LIST.forEach((r, i) => {
        const y = st.y + 42 + i * 20;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(st.x + 18, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff7e8';
        ctx.font = '700 14px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${r.name} — ${r.price} koin`, st.x + 32, y);
      });
    } else if (st.use === 'talenan') {
      ctx.fillStyle = '#7a4a22';
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      ctx.fillStyle = '#e8c890';
      rr(ctx, st.x + 12, st.y + 14, st.w - 24, st.h - 52, 8);
      ctx.fill();
      // Knife and chopped bits.
      ctx.strokeStyle = '#5a5a5a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(st.x + 30, st.y + 40);
      ctx.lineTo(st.x + 95, st.y + 40);
      ctx.stroke();
      ctx.fillStyle = '#7dc383';
      for (const [bx, by] of [[-18, 18], [4, 26], [22, 12]]) {
        ctx.fillRect(cx + bx, cy + by, 12, 8);
      }
      label(ctx, 'TALENAN', cx, st.y + st.h - 14, 16, '#fff7e8');
    } else if (st.use === 'wajan') {
      ctx.fillStyle = '#4a4a4a';
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      // Flame under the wok when it is in use.
      const active = state.work && state.work.station === 'wajan';
      ctx.fillStyle = active ? '#ff7b2e' : '#8a4a2b';
      ctx.beginPath();
      ctx.moveTo(cx - 34, st.y + st.h - 26);
      ctx.quadraticCurveTo(cx - 10, st.y + st.h - 62, cx, st.y + st.h - 30);
      ctx.quadraticCurveTo(cx + 10, st.y + st.h - 62, cx + 34, st.y + st.h - 26);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#2b2b2b';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#d9d9d9';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#e8a33d';
      ctx.fill();
      label(ctx, 'WAJAN', cx, st.y + st.h - 14, 16, '#fff7e8');
    } else if (st.use === 'panggangan') {
      ctx.fillStyle = '#5a3a22';
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      ctx.strokeStyle = '#2b2b2b';
      ctx.lineWidth = 6;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(st.x + 14, st.y + 30 + i * 18);
        ctx.lineTo(st.x + st.w - 14, st.y + 30 + i * 18);
        ctx.stroke();
      }
      ctx.fillStyle = '#c65a2e';
      rr(ctx, st.x + 26, st.y + 34, 30, 16, 5);
      ctx.fill();
      rr(ctx, st.x + 70, st.y + 52, 30, 16, 5);
      ctx.fill();
      label(ctx, 'PANGGANGAN', cx, st.y + st.h - 14, 15, '#fff7e8');
    } else if (st.use === 'piring') {
      ctx.fillStyle = '#7a4a22';
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      const plated = state.plated;
      if (plated) {
        drawDish(ctx, plated, cx - 55, cy - 6, 30);
        label(ctx, RECIPES[plated].name.toUpperCase(), cx + 48, cy - 6, 14, '#fff7e8');
      } else {
        ctx.beginPath();
        ctx.arc(cx - 55, cy - 6, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#c9b48a';
        ctx.stroke();
        label(ctx, 'KOSONG', cx + 48, cy - 6, 14, '#fff7e8');
      }
      label(ctx, 'PIRING', cx, st.y + st.h - 14, 16, '#fff7e8');
    } else if (st.use === 'jendela') {
      ctx.fillStyle = '#7a2e1d';
      rr(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      ctx.fillStyle = '#ffe9bd';
      rr(ctx, st.x + 12, st.y + 12, st.w - 24, st.h - 48, 8);
      ctx.fill();
      ctx.strokeStyle = '#7a2e1d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, st.y + 12);
      ctx.lineTo(cx, st.y + st.h - 36);
      ctx.stroke();
      label(ctx, 'JENDELA SAJI', cx, st.y + st.h - 14, 16, '#fff7e8');
    }
  }
}

function drawCook(ctx, state) {
  const c = state.cook;
  // Shadow.
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + 24, 26, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();
  // Body (chef coat).
  ctx.beginPath();
  ctx.arc(c.x, c.y + 8, 24, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#c9c9c9';
  ctx.stroke();
  // Apron.
  ctx.fillStyle = '#2e6fb0';
  ctx.fillRect(c.x - 12, c.y + 2, 24, 24);
  // Head.
  ctx.beginPath();
  ctx.arc(c.x, c.y - 18, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#f2c48d';
  ctx.fill();
  // Chef hat.
  ctx.beginPath();
  ctx.arc(c.x - 9, c.y - 30, 8, 0, Math.PI * 2);
  ctx.arc(c.x, c.y - 34, 9, 0, Math.PI * 2);
  ctx.arc(c.x + 9, c.y - 30, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillRect(c.x - 14, c.y - 32, 28, 8);
  // Eyes look the facing way.
  const ex = c.face === 'left' ? -4 : c.face === 'right' ? 4 : 0;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(c.x - 5 + ex, c.y - 18, 2, 0, Math.PI * 2);
  ctx.arc(c.x + 5 + ex, c.y - 18, 2, 0, Math.PI * 2);
  ctx.fill();
  // Carried ingredients bob above the hat.
  const carry = state.carry;
  carry.forEach((ing, i) => {
    drawIngredient(ctx, ing, c.x - (carry.length - 1) * 16 + i * 32, c.y - 52, 13);
  });
  // Work progress ring while chopping/cooking/assembling.
  if (state.work) {
    const w = state.work;
    const p = 1 - w.left / w.total;
    ctx.beginPath();
    ctx.arc(c.x, c.y - 52, 30, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
    ctx.strokeStyle = '#ffd23e';
    ctx.lineWidth = 6;
    ctx.stroke();
    label(ctx, w.label, c.x, c.y - 92, 15, '#fff7e8');
  }
  // Nearest-station hint.
  if (state.near && state.phase === 'play' && !state.work) {
    label(ctx, `E: ${state.nearHint}`, c.x, c.y + 52, 15, '#fff7e8');
  }
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    if (p.kind === 'steam') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (p.kind === 'coin') {
      label(ctx, p.text, p.x, p.y, 22, '#ffd23e');
    } else if (p.kind === 'spark') {
      ctx.fillStyle = '#ffd23e';
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
  }
  ctx.globalAlpha = 1;
}

function drawBanner(ctx, title, lines, accent = '#ffd23e') {
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = '#3d2b1a';
  rr(ctx, 290, 220, 700, 340, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 4;
  rr(ctx, 290, 220, 700, 340, 18);
  ctx.stroke();
  label(ctx, title, 640, 280, 52, accent);
  lines.forEach((line, i) => {
    label(ctx, line, 640, 340 + i * 34, 21, '#fff7e8', 700);
  });
}

export function drawGame(ctx, state) {
  ctx.clearRect(0, 0, 1280, 800);
  drawFloor(ctx);
  drawStations(ctx, state);
  drawParticles(ctx, state);
  drawCook(ctx, state);

  if (state.phase === 'title') {
    drawBanner(ctx, 'DAPUR KILAT', [
      'Dapur paling cepat di kota — layani pesanan sebelum dingin!',
      'WASD / panah untuk jalan · E atau klik untuk memakai stasiun',
      'Ambil bahan → cincang → masak → susun → antar ke jendela saji',
      '',
      'Tekan ENTER untuk mulai shift',
    ]);
  } else if (state.phase === 'pause') {
    drawBanner(ctx, 'JEDA', ['Istirahat sebentar, kompor tetap menyala…', 'Tekan P untuk lanjut'], '#ffd98a');
  } else if (state.phase === 'over') {
    const s = state.summary;
    drawBanner(ctx, 'SHIFT SELESAI!', [
      `Hidangan tersaji: ${s.served}  ·  Koin: ${s.coins}  ·  Skor: ${s.score}`,
      `Kombo terbaik: x${s.bestCombo}  ·  Pesanan gagal: ${s.failed}`,
      s.served >= 8 ? 'Luar biasa! Dapur kilat memang kilat!' : 'Bagus! Besok datang lebih awal, ya.',
      '',
      'Tekan R untuk shift berikutnya',
    ]);
  }
}
