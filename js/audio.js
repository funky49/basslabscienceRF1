import { MIN_HZ, MAX_HZ, APP_TITLE } from './constants.js';
import { state } from './state.js';
import { updateHeaderUI } from './ui.js';
import { getNoteLabel } from './music.js';
import { NOTES, SONG_LIBRARY, TRANSPOSE_SEMITONES } from './songs-data.js';

function initAudio() {
  if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
  triggerFirstAction();
  return state.audioCtx;
}

function triggerFirstAction() {
  if (!state.isFirstActionTaken) {
    state.isFirstActionTaken = true;
    document.getElementById('leftArrow').style.display = 'none';
    document.getElementById('rightArrow').style.display = 'none';
    updateHeaderUI(state.currentHz, APP_TITLE);
  }
}

function startViz() {
  const canvas = document.getElementById('waveCanvas');
  const ctx = canvas.getContext('2d');
  const draw = () => {
    if (!state.analyser) return;
    state.vizRAF = requestAnimationFrame(draw);

    if (canvas.width !== canvas.clientWidth) canvas.width = canvas.clientWidth;
    if (canvas.height !== canvas.clientHeight) canvas.height = canvas.clientHeight;

    const buffer = new Uint8Array(state.analyser.fftSize);
    state.analyser.getByteTimeDomainData(buffer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    for (let i = 0; i < buffer.length; i++) {
      const x = (i / buffer.length) * canvas.width;
      const y = (buffer[i] / 255) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  draw();
}

export function stopAll(manualClick = false) {
  if (state.melodyTimeout) clearTimeout(state.melodyTimeout);
  if (state.sweepTimer) clearTimeout(state.sweepTimer);
  state.isSongPlaying = false;

  if (state.activeGain && state.audioCtx) {
    const now = state.audioCtx.currentTime;
    state.activeGain.gain.cancelScheduledValues(now);
    state.activeGain.gain.setValueAtTime(state.activeGain.gain.value, now);
    state.activeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    if (state.activeOsc) {
      try {
        state.activeOsc.stop(now + 0.06);
      } catch {
        /* already stopped */
      }
    }
  }
  state.activeOsc = null;
  state.activeGain = null;

  if (state.vizRAF) cancelAnimationFrame(state.vizRAF);
  const canvas = document.getElementById('waveCanvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  document.querySelectorAll('.playing, .active-key').forEach((el) => el.classList.remove('playing', 'active-key'));
  document.getElementById('readmeDisplay').classList.remove('visible');

  if (state.isFirstActionTaken) {
    updateHeaderUI(state.currentHz, APP_TITLE);
  }

  if (manualClick && state.mainMode === 'generator') {
    document.querySelectorAll('.sub-btn').forEach((b) => b.classList.remove('active-tab', 'flashing'));
    state.genMode = 'off';
  }
}

export function playTone(freq) {
  const ctx = initAudio();
  stopAll();
  state.activeOsc = ctx.createOscillator();
  state.activeGain = ctx.createGain();
  state.analyser = ctx.createAnalyser();

  state.activeOsc.frequency.setValueAtTime(freq, ctx.currentTime);
  state.activeGain.gain.setValueAtTime(0, ctx.currentTime);
  state.activeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);

  state.activeOsc.connect(state.activeGain).connect(state.analyser).connect(ctx.destination);
  state.activeOsc.start();
  startViz();
}

export function setGeneratorModeTone() {
  playTone(state.currentHz);
  updateHeaderUI(state.currentHz);
}

export function triggerSweep() {
  const slMedian = document.getElementById('slMedian');
  const slRange = document.getElementById('slRange');
  const slTime = document.getElementById('slTime');
  const median = parseFloat(slMedian.value);
  const range = parseFloat(slRange.value);
  const time = parseFloat(slTime.value);
  const start = median - range / 2;
  const end = median + range / 2;

  stopAll();
  const ctx = initAudio();
  state.activeOsc = ctx.createOscillator();
  state.activeGain = ctx.createGain();
  state.analyser = ctx.createAnalyser();

  state.activeGain.gain.setValueAtTime(0, ctx.currentTime);
  state.activeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);

  state.activeOsc.connect(state.activeGain).connect(state.analyser).connect(ctx.destination);
  state.activeOsc.start();
  startViz();
  updateHeaderUI(median, `${APP_TITLE} - Sweeping`);

  const sweepCycle = () => {
    const now = ctx.currentTime;
    state.activeOsc.frequency.setValueAtTime(start, now);
    state.activeOsc.frequency.linearRampToValueAtTime(end, now + time);
    state.activeOsc.frequency.linearRampToValueAtTime(start, now + time * 2);
    state.sweepTimer = setTimeout(sweepCycle, time * 2 * 1000);
  };

  sweepCycle();
}

export function triggerToyMacro(type) {
  stopAll();
  const ctx = initAudio();
  state.activeOsc = ctx.createOscillator();
  state.activeGain = ctx.createGain();
  state.analyser = ctx.createAnalyser();

  const start = type === 'rise' ? 25 : 75;
  const end = type === 'rise' ? 75 : 25;

  state.activeOsc.frequency.setValueAtTime(start, ctx.currentTime);
  state.activeOsc.frequency.linearRampToValueAtTime(end, ctx.currentTime + 7);

  state.activeGain.gain.setValueAtTime(0, ctx.currentTime);
  state.activeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
  state.activeGain.gain.setValueAtTime(0.3, ctx.currentTime + 6.9);
  state.activeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 7);

  state.activeOsc.connect(state.activeGain).connect(state.analyser).connect(ctx.destination);
  state.activeOsc.start();
  state.activeOsc.stop(ctx.currentTime + 7.1);
  startViz();
  updateHeaderUI(50, type === 'rise' ? 'Bass Rise' : 'mmm Drop');
}

export async function playSongLoop(id) {
  state.isSongPlaying = true;
  const song = SONG_LIBRARY[id];

  while (state.isSongPlaying) {
    for (const note of song.notes) {
      if (!state.isSongPlaying) break;

      const freq = NOTES[note.n] * Math.pow(2, (TRANSPOSE_SEMITONES + song.trim) / 12);

      if (state.activeGain && state.audioCtx) {
        const now = state.audioCtx.currentTime;
        state.activeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        if (state.activeOsc) {
          try {
            state.activeOsc.stop(now + 0.03);
          } catch {
            /* */
          }
        }
      }

      if (freq > 0) {
        const ctx = initAudio();
        state.activeOsc = ctx.createOscillator();
        state.activeGain = ctx.createGain();
        if (!state.analyser) state.analyser = ctx.createAnalyser();

        state.activeOsc.frequency.setValueAtTime(freq, ctx.currentTime);
        state.activeGain.gain.setValueAtTime(0, ctx.currentTime);
        state.activeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);

        state.activeOsc.connect(state.activeGain).connect(state.analyser).connect(ctx.destination);
        state.activeOsc.start();
        startViz();
        updateHeaderUI(freq, `${getNoteLabel(freq)} - ${freq.toFixed(1)} Hz`);
      }

      await new Promise((r) => {
        state.melodyTimeout = setTimeout(r, note.d);
      });
    }
  }
}

export function updateHzFromControls(newHz) {
  state.currentHz = Math.max(MIN_HZ, Math.min(MAX_HZ, newHz));
  updateHeaderUI(state.currentHz);
  if (state.activeOsc && state.genMode === 'tone') {
    state.activeOsc.frequency.setTargetAtTime(state.currentHz, state.audioCtx.currentTime, 0.05);
  }
}
