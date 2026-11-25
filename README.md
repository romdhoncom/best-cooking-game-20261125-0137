[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/romdhoncom/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/romdhoncom/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Dapur Kilat — Lightning Kitchen

A fast-paced Indonesian street-kitchen cooking game. Orders land on the
board, and you are the only cook: run the kitchen, chain the steps, and
serve every dish before its timer runs out. A 3-minute shift, 3 hearts.

## How to play

- **Move:** WASD or arrow keys (or click a station to walk there).
- **Use a station:** E, Enter, Space, or click the station when close.
- **The chain:** take ingredients from the crates → chop at the talenan →
  cook at the wajan or panggangan → assemble on the piring → serve at the
  jendela saji. The order board tells you the next step of the oldest order.
- **Scoring:** each dish pays its price in coins, plus a speed bonus for
  serving with more than half its time left, times a combo multiplier that
  grows with every fast serve. An expired order costs a heart and resets
  the combo. Lose all 3 hearts (or run out the shift clock) and the shift ends.
- **Keys:** M mute · P pause · R restart · Enter start.

## The menu

| Dish | Price | Recipe |
| --- | --- | --- |
| Nasi Goreng | 25 | Nasi + Telur + Cabai, goreng di wajan |
| Mie Goreng | 22 | Mie + Ayam + Sayur, cincang lalu goreng di wajan |
| Sate Ayam | 30 | Ayam + Cabai, tusuk lalu bakar di panggangan |
| Gado-Gado | 20 | Sayur + Telur, cincang lalu susun di piring |

## Structure

- `game/index.html` + `game/style.css` — page shell, order board, HUD.
- `game/src/main.js` — game loop, state, interaction, HUD.
- `game/src/recipes.js` — dishes, ingredients, recipe steps.
- `game/src/orders.js` — order board, spawning, timers, rewards.
- `game/src/kitchen.js` — stations, cook movement, reach.
- `game/src/render.js` — all canvas drawing (no image files).
- `game/src/audio.js` — synthesized WebAudio sounds, no files.
- `game/src/input.js` — keyboard + mouse.
- `game/src/shots.js` — deterministic screenshot scenes (`?shot=`).
- `main.ts` — hands game/ + screenshots/ in, writes dossier.json.
- `serve.ts` — `node serve.ts` serves game/ on http://localhost:8080.

Everything is drawn or synthesized in code; the game makes no network
request and loads no file outside game/.
