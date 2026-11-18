import { playTone, stopAll } from './audio.js';
import { updateHeaderUI } from './ui.js';
import { getNoteLabel } from './music.js';

const KEYS = [
  { f: 27.5, t: 'white' },
  { f: 29.14, t: 'black' },
  { f: 30.87, t: 'white' },
  { f: 32.7, t: 'white' },
  { f: 34.65, t: 'black' },
  { f: 36.71, t: 'white' },
  { f: 38.89, t: 'black' },
  { f: 41.2, t: 'white' },
  { f: 43.65, t: 'white' },
  { f: 46.25, t: 'black' },
  { f: 49.0, t: 'white' },
  { f: 51.91, t: 'black' },
  { f: 55.0, t: 'white' },
];

export function buildKeyboard() {
  const piano = document.getElementById('pianoContainer');
  let lastWhiteWrapper = null;

  KEYS.forEach((k) => {
    const el = document.createElement('div');
    el.className = `key ${k.t}`;

    const handlePress = (e) => {
      e.preventDefault();
      playTone(k.f);
      el.classList.add('active-key');
      updateHeaderUI(k.f, `${getNoteLabel(k.f)} - ${k.f.toFixed(2)} Hz`);
    };

    el.onpointerdown = handlePress;
    el.onpointerup = el.onpointerleave = stopAll;

    if (k.t === 'white') {
      const wrap = document.createElement('div');
      wrap.className = 'white-key-wrapper';
      wrap.appendChild(el);
      piano.appendChild(wrap);
      lastWhiteWrapper = wrap;
    } else if (lastWhiteWrapper) {
      lastWhiteWrapper.appendChild(el);
    }
  });
}
