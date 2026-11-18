import { state } from './state.js';
import * as audio from './audio.js';
import { updateHeaderUI, showReadme } from './ui.js';
import { SONG_LIBRARY } from './songs-data.js';
import { buildKeyboard } from './keyboard.js';

function switchMainMode(mode) {
  audio.stopAll(true);
  state.mainMode = mode;
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active-tab'));
  document.getElementById(`tab-${mode}`).classList.add('active-tab');

  document.querySelectorAll('.content-panel').forEach((p) => p.classList.remove('active-panel'));
  document.getElementById(`mode-${mode}`).classList.add('active-panel');
}

function setGeneratorMode(mode) {
  document.getElementById('sub-tone').classList.remove('flashing');
  audio.stopAll();
  state.genMode = mode;

  document.querySelectorAll('.sub-btn').forEach((b) => b.classList.remove('active-tab'));
  document.getElementById(`sub-${mode}`).classList.add('active-tab');

  document.querySelectorAll('.gen-ui').forEach((ui) => ui.classList.remove('active-gen-ui'));
  document.getElementById(`ui-${mode}`).classList.add('active-gen-ui');

  if (mode === 'tone') {
    audio.setGeneratorModeTone();
  }
}

function initSongs() {
  const grid = document.getElementById('songGrid');
  Object.keys(SONG_LIBRARY).forEach((id) => {
    const btn = document.createElement('button');
    btn.textContent = SONG_LIBRARY[id].title;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('playing')) {
        audio.stopAll(true);
      } else {
        audio.stopAll();
        btn.classList.add('playing');
        audio.playSongLoop(id);
      }
    });
    grid.appendChild(btn);
  });
}

function wireSweepSliders() {
  const slMedian = document.getElementById('slMedian');
  const slRange = document.getElementById('slRange');
  const slTime = document.getElementById('slTime');

  const updateSweepUI = () => {
    document.getElementById('valMedian').innerText = slMedian.value;
    document.getElementById('valRange').innerText = slRange.value;
    document.getElementById('valTime').innerText = slTime.value;
  };

  [slMedian, slRange, slTime].forEach((el) => el.addEventListener('input', updateSweepUI));
  [slMedian, slRange, slTime].forEach((el) => el.addEventListener('change', () => audio.triggerSweep()));
}

function wireToneControls() {
  const updateHz = (newHz) => {
    audio.updateHzFromControls(newHz);
  };

  document.getElementById('btnFreqDown').addEventListener('click', () => updateHz(state.currentHz - 0.5));
  document.getElementById('btnFreqUp').addEventListener('click', () => updateHz(state.currentHz + 0.5));

  const knob = document.getElementById('mainKnob');
  let isDragging = false;
  let startY = 0;
  let startHz = 49;

  knob.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startHz = state.currentHz;
    knob.setPointerCapture(e.pointerId);
  });

  knob.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY;
    updateHz(startHz + deltaY * 0.25);
  });

  knob.addEventListener('pointerup', () => {
    isDragging = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mainHeader').addEventListener('click', () => audio.stopAll(true));

  document.getElementById('tab-generator').addEventListener('click', () => switchMainMode('generator'));
  document.getElementById('tab-song').addEventListener('click', () => switchMainMode('song'));
  document.getElementById('tab-toy').addEventListener('click', () => switchMainMode('toy'));

  document.getElementById('sub-tone').addEventListener('click', () => setGeneratorMode('tone'));
  document.getElementById('sub-sweep').addEventListener('click', () => setGeneratorMode('sweep'));
  document.getElementById('sub-keyboard').addEventListener('click', () => setGeneratorMode('keyboard'));
  document.getElementById('sub-off').addEventListener('click', () => audio.stopAll(true));

  document.getElementById('mainFooter').querySelector('.global-stop-btn').addEventListener('click', () => audio.stopAll(true));

  document.querySelector('[data-toy="rise"]').addEventListener('click', () => audio.triggerToyMacro('rise'));
  document.querySelector('[data-toy="drop"]').addEventListener('click', () => audio.triggerToyMacro('drop'));

  document.querySelectorAll('[data-stop-all]').forEach((btn) => {
    btn.addEventListener('click', () => audio.stopAll(true));
  });

  document.getElementById('btn-readme').addEventListener('click', showReadme);

  buildKeyboard();
  initSongs();
  wireSweepSliders();
  wireToneControls();
});
