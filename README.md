# okero.js

A frog that follows the cursor, based on [oneko.js](https://github.com/adryd325/oneko.js) (MIT) and the [classic Neko cat](https://en.wikipedia.org/wiki/Neko_(software)). 
Frog sprite art (okero.png) is from [pop-shop-packs.itch.io](https://pop-shop-packs.itch.io/frogs-pixel-asset-pack).

## Usage

```html
<script src="okero.js" data-kero="okero.png"></script>
```

Place the `<script>` tag anywhere in your HTML (typically before `</body>`). The frog renders as a fixed-position element on top of all page content.

## Options

Set via `data-*` attributes on the script tag:

| Attribute | Default | Description |
|---|---|---|
| `data-kero` | `./okero.png` | Path to the sprite sheet |
| `data-persist-position` | `true` | Save/restore frog position across page loads via `localStorage`. Set to `false` to disable. |

## Behavior

- Follows the mouse cursor (and touch on mobile)
- Idles with a slow look-around animation when the cursor is nearby
- Falls asleep after ~20 seconds of idling
- Wakes and leaps when the cursor moves away
- Flips horizontally to face the direction of travel
- Respects `prefers-reduced-motion` — disabled entirely if set

## Sprite sheet format

The sprite sheet is a single image: **8 columns × 4 rows** of **64×64px** frames (512×256px total). 
The script only uses the sprite art from columns 2 and 3.

| Column | Row | Animation |
|---|---|---|
| 3 | 0 | Moving — land frame |
| 3 | 1 | Moving — leap frame |
| 3 | 2 | Idle / Tired |
| 3 | 3 | Idle (alternate) |
| 2 | 0 | Sleeping frame 1 |
| 2 | 1 | Sleeping frame 2 |

The frog sprite naturally faces to the left. The script flips it with `scaleX(-1)` when moving right. Depending upon which sprite sheet you use, this may not be necessary.
