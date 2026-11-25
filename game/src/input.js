// Dapur Kilat — input: keyboard (WASD/arrows + E) and mouse (click a station).
// The module owns the key state and translates clicks on the canvas into
// canvas coordinates; the game loop reads it every frame.

export function makeInput(canvas, hooks) {
  const keys = new Set();
  const input = { keys, mouse: { x: 0, y: 0, clicked: false, down: false } };

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Enter: 'interact', Space: 'interact',
  };

  window.addEventListener('keydown', (e) => {
    if (KEYMAP[e.code]) {
      keys.add(KEYMAP[e.code]);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.code === 'KeyM') hooks.onMute();
      if (e.code === 'KeyR') hooks.onRestart();
      if (e.code === 'KeyP') hooks.onPause();
      if (e.code === 'Enter' || e.code === 'Space') hooks.onConfirm();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (KEYMAP[e.code]) keys.delete(KEYMAP[e.code]);
  });
  window.addEventListener('blur', () => keys.clear());

  function toCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = toCanvas(e);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = toCanvas(e);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.mouse.down = true;
  });
  window.addEventListener('mouseup', (e) => {
    input.mouse.down = false;
    const p = toCanvas(e);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.mouse.clicked = true;
    hooks.onClick(p.x, p.y);
  });

  // Direction vector from the held keys, normalized.
  input.dir = function dir() {
    let x = 0;
    let y = 0;
    if (keys.has('left')) x -= 1;
    if (keys.has('right')) x += 1;
    if (keys.has('up')) y -= 1;
    if (keys.has('down')) y += 1;
    if (x !== 0 && y !== 0) { x *= 0.7071; y *= 0.7071; }
    return { x, y };
  };

  input.consumeInteract = function consumeInteract() {
    if (keys.has('interact')) {
      keys.delete('interact');
      return true;
    }
    return false;
  };

  return input;
}
