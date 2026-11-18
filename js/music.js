const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getNoteLabel(freq) {
  const n = Math.round(12 * Math.log2(freq / 440)) + 48;
  return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12)}`;
}
