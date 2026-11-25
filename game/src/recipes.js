// Dapur Kilat — recipes: every dish is a short chain of steps through the kitchen.
// A step names the station that performs it and the ingredient it consumes.
// chop: talenan (chopping board). cook: wajan (wok) or panggangan (grill).
// assemble: piring (plating counter). serve: jendela (serving window).

export const INGREDIENTS = {
  nasi:   { name: 'Nasi',   short: 'Nasi',   color: '#fff3d6', emoji: '🍚' },
  mie:    { name: 'Mie',    short: 'Mie',    color: '#f2c14e', emoji: '🍜' },
  ayam:   { name: 'Ayam',   short: 'Ayam',   color: '#e8956d', emoji: '🍗' },
  telur:  { name: 'Telur',  short: 'Telur',  color: '#ffe9a8', emoji: '🥚' },
  sayur:  { name: 'Sayur',  short: 'Sayur',  color: '#7dc383', emoji: '🥬' },
  cabai:  { name: 'Cabai',  short: 'Cabai',  color: '#d93a2b', emoji: '🌶️' },
};

export const RECIPES = {
  nasgor: {
    id: 'nasgor', name: 'Nasi Goreng', price: 25, color: '#e8a33d', emoji: '🍛',
    blurb: 'Nasi + telur + cabai, goreng di wajan',
    steps: [
      { kind: 'take',  ingredient: 'nasi',  label: 'Ambil Nasi' },
      { kind: 'take',  ingredient: 'telur', label: 'Ambil Telur' },
      { kind: 'take',  ingredient: 'cabai', label: 'Ambil Cabai' },
      { kind: 'cook',  station: 'wajan',    label: 'Goreng di Wajan', seconds: 3 },
      { kind: 'serve', station: 'jendela',  label: 'Antar ke Jendela' },
    ],
  },
  miegor: {
    id: 'miegor', name: 'Mie Goreng', price: 22, color: '#d98a2b', emoji: '🍝',
    blurb: 'Mie + ayam + sayur, goreng di wajan',
    steps: [
      { kind: 'take',  ingredient: 'mie',   label: 'Ambil Mie' },
      { kind: 'take',  ingredient: 'ayam',  label: 'Ambil Ayam' },
      { kind: 'take',  ingredient: 'sayur', label: 'Ambil Sayur' },
      { kind: 'chop',  station: 'talenan',  label: 'Cincang di Talenan', seconds: 2 },
      { kind: 'cook',  station: 'wajan',    label: 'Goreng di Wajan', seconds: 3 },
      { kind: 'serve', station: 'jendela',  label: 'Antar ke Jendela' },
    ],
  },
  sate: {
    id: 'sate', name: 'Sate Ayam', price: 30, color: '#c65a2e', emoji: '🍢',
    blurb: 'Ayam + cabai, bakar di panggangan',
    steps: [
      { kind: 'take',  ingredient: 'ayam',  label: 'Ambil Ayam' },
      { kind: 'take',  ingredient: 'cabai', label: 'Ambil Cabai' },
      { kind: 'chop',  station: 'talenan',  label: 'Tusuk di Talenan', seconds: 2 },
      { kind: 'cook',  station: 'panggangan', label: 'Bakar di Panggangan', seconds: 4 },
      { kind: 'serve', station: 'jendela',  label: 'Antar ke Jendela' },
    ],
  },
  gado: {
    id: 'gado', name: 'Gado-Gado', price: 20, color: '#5da85f', emoji: '🥗',
    blurb: 'Sayur + telur, cincang lalu susun',
    steps: [
      { kind: 'take',  ingredient: 'sayur', label: 'Ambil Sayur' },
      { kind: 'take',  ingredient: 'telur', label: 'Ambil Telur' },
      { kind: 'chop',  station: 'talenan',  label: 'Cincang di Talenan', seconds: 2 },
      { kind: 'assemble', station: 'piring', label: 'Susun di Piring', seconds: 1 },
      { kind: 'serve', station: 'jendela',  label: 'Antar ke Jendela' },
    ],
  },
};

export const RECIPE_LIST = [RECIPES.nasgor, RECIPES.miegor, RECIPES.sate, RECIPES.gado];

// Short labels for the order board: what the cook still has to do.
export function stepSummary(recipe, stepIndex) {
  return recipe.steps.slice(stepIndex).map((s) => s.label).join(' → ');
}
