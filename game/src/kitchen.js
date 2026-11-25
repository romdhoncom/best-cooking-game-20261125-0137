// Dapur Kilat — the kitchen: stations, the cook's movement, and interaction.
// The kitchen is one room, 1280x800, with counters along the walls and a floor
// the cook walks on. Every station has a rectangle and a label; the cook
// interacts with the nearest station in reach by pressing E or clicking it.

import { INGREDIENTS } from './recipes.js';

export const KITCHEN_W = 1280;
export const KITCHEN_H = 800;

// Stations along the walls. x/y/w/h are canvas pixels. `use` names the
// station id the recipe steps refer to; crates name an ingredient instead.
export const STATIONS = [
  // Top wall: ingredient crates.
  { id: 'crate-nasi',  kind: 'crate', ingredient: 'nasi',  x: 60,  y: 30, w: 120, h: 90 },
  { id: 'crate-mie',   kind: 'crate', ingredient: 'mie',   x: 200, y: 30, w: 120, h: 90 },
  { id: 'crate-ayam',  kind: 'crate', ingredient: 'ayam',  x: 340, y: 30, w: 120, h: 90 },
  { id: 'crate-telur', kind: 'crate', ingredient: 'telur', x: 480, y: 30, w: 120, h: 90 },
  { id: 'crate-sayur', kind: 'crate', ingredient: 'sayur', x: 620, y: 30, w: 120, h: 90 },
  { id: 'crate-cabai', kind: 'crate', ingredient: 'cabai', x: 760, y: 30, w: 120, h: 90 },
  // Top-right: the menu board on the wall.
  { id: 'menu', kind: 'menu', x: 920, y: 24, w: 320, h: 110 },
  // Left wall: chopping board (top) and grill (below it).
  { id: 'talenan', kind: 'work', use: 'talenan', x: 30, y: 240, w: 130, h: 150 },
  { id: 'panggangan', kind: 'work', use: 'panggangan', x: 30, y: 430, w: 130, h: 150 },
  // Right wall: wok stove.
  { id: 'wajan', kind: 'work', use: 'wajan', x: 1120, y: 240, w: 130, h: 150 },
  // Bottom wall: plating counter (left) and serving window (right).
  { id: 'piring', kind: 'work', use: 'piring', x: 60, y: 660, w: 220, h: 110 },
  { id: 'jendela', kind: 'work', use: 'jendela', x: 980, y: 660, w: 240, h: 110 },
];

export function stationById(id) {
  return STATIONS.find((s) => s.id === id) || null;
}

export function stationByUse(use) {
  return STATIONS.find((s) => s.use === use) || null;
}

export function stationLabel(st) {
  if (st.kind === 'crate') return INGREDIENTS[st.ingredient].name;
  if (st.kind === 'menu') return 'MENU';
  if (st.use === 'talenan') return 'TALENAN';
  if (st.use === 'wajan') return 'WAJAN';
  if (st.use === 'panggangan') return 'PANGGANGAN';
  if (st.use === 'piring') return 'PIRING';
  if (st.use === 'jendela') return 'JENDELA SAJI';
  return st.id;
}

// Each station has an approach point just outside the edge that faces the
// floor. The cook interacts with a station by standing near ITS approach
// point — measuring to the station's rectangle instead lets a tall side
// station steal the interaction from the station the cook stands in front
// of (the grill once stole the serving window's).
export function approachPoint(st) {
  const cx = st.x + st.w / 2;
  const cy = st.y + st.h / 2;
  if (st.kind === 'crate') return { x: cx, y: st.y + st.h + 44 };
  if (st.use === 'talenan' || st.use === 'panggangan') return { x: st.x + st.w + 44, y: cy };
  if (st.use === 'wajan') return { x: st.x - 44, y: cy };
  return { x: cx, y: st.y - 44 }; // piring, jendela: approach from above
}

// The cook: a circle that walks the floor, blocked by the counters.
export function makeCook() {
  return { x: 640, y: 430, r: 26, speed: 300, face: 'down', moving: false };
}

const FLOOR = { x: 170, y: 140, w: 940, h: 500 };

export function moveCook(cook, dx, dy, dt) {
  const nx = cook.x + dx * cook.speed * dt;
  const ny = cook.y + dy * cook.speed * dt;
  const r = cook.r;
  cook.x = Math.max(FLOOR.x + r, Math.min(FLOOR.x + FLOOR.w - r, nx));
  cook.y = Math.max(FLOOR.y + r, Math.min(FLOOR.y + FLOOR.h - r, ny));
  cook.moving = dx !== 0 || dy !== 0;
  if (dy > 0) cook.face = 'down';
  else if (dy < 0) cook.face = 'up';
  else if (dx > 0) cook.face = 'right';
  else if (dx < 0) cook.face = 'left';
}

// Nearest station whose approach point is within reach of the cook.
export function nearestStation(cook, reach = 70) {
  let best = null;
  let bestD = Infinity;
  for (const st of STATIONS) {
    if (st.kind === 'menu') continue;
    const ap = approachPoint(st);
    const d = Math.hypot(cook.x - ap.x, cook.y - ap.y);
    if (d < bestD) { bestD = d; best = st; }
  }
  return bestD <= reach ? best : null;
}

export function stationAtPoint(px, py) {
  return STATIONS.find((s) => px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) || null;
}

export { FLOOR };
