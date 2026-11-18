import { MIN_HZ, MAX_HZ, APP_TITLE, README_TEXT } from './constants.js';
import { state } from './state.js';

export function updateHeaderUI(hz, overrideLabel = null) {
  if (!state.isFirstActionTaken) return;

  const clampedHz = Math.max(MIN_HZ, Math.min(MAX_HZ, hz));
  const pct = ((clampedHz - MIN_HZ) / (MAX_HZ - MIN_HZ)) * 100;

  document.getElementById('freqFill').style.width = `${pct}%`;

  const headerText = document.getElementById('headerText');
  if (overrideLabel) {
    headerText.innerHTML = overrideLabel;
  } else {
    headerText.innerHTML = `${APP_TITLE}<br><small>${hz.toFixed(1)} Hz</small>`;
  }

  const angle = -135 + (pct / 100) * 270;
  document.getElementById('knobPointer').style.transform = `translateX(-50%) rotate(${angle}deg)`;
  document.getElementById('toneHzReadout').textContent = hz.toFixed(1);
}

export function showReadme() {
  const box = document.getElementById('readmeDisplay');
  box.innerText = README_TEXT + '\n\n(Tap anywhere to dismiss)';
  box.classList.add('visible');
  box.onclick = () => box.classList.remove('visible');
}
