/** Shared mutable app state (single audio graph + UI mode). */
export const state = {
  audioCtx: null,
  activeOsc: null,
  activeGain: null,
  analyser: null,
  vizRAF: null,
  melodyTimeout: null,
  sweepTimer: null,
  isFirstActionTaken: false,
  currentHz: 49,
  mainMode: 'generator',
  genMode: null,
  isSongPlaying: false,
};
