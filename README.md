# basslabscienceRF1

basslab.science — refactor 1 (Oobleck Dance Generator 1.6g, modular).

Refactored static site: ES modules, no inline `onclick`, shared `state`, and split modules under `js/`.

GitHub Pages deploys from `main` via `.github/workflows/static.yml`.

### Layout

| Path | Role |
|------|------|
| `index.html` | Markup only; loads `js/main.js` as `type="module"` |
| `style.css` | Same look as 1.6f |
| `js/main.js` | DOM wiring |
| `js/audio.js` | Web Audio + visualizer |
| `js/ui.js` | Header / readme overlay |
| `js/keyboard.js` | Piano keys |
| `js/songs-data.js` | `SONG_LIBRARY`, `NOTES` |
| `js/music.js` | Note labels |
| `js/constants.js` | Titles and Hz limits |
| `js/state.js` | Shared mutable state |

### Thanks

"Boomer" Hughes, "Spooky" Hamilton, Eric Wright aka "chozo", Glen Carter aka "Thee DJ Q"
