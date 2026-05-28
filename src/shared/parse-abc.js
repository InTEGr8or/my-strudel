const SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const MIDI_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

function parseAbc(text) {
  const lines = text.split('\n');
  let title = '';
  const bodyLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('T:')) title = trimmed.slice(2).trim();
    else if (!/^[A-Z]:/.test(trimmed)) bodyLines.push(trimmed);
  }
  const body = bodyLines.join(' ').replace(/[|:[\]]/g, ' ');
  const notes = [];
  const re = /([\^_=])?([A-Ga-g])([',]*)(?:\/?\d*)?/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const letter = m[2];
    const markers = m[3];
    let oct = letter === letter.toUpperCase() ? 4 : 5;
    for (const ch of markers) {
      if (ch === "'") oct++;
      else if (ch === ',') oct--;
    }
    if (oct >= 1 && oct <= 8) {
      notes.push({ note: letter.toUpperCase(), oct });
    }
  }
  return { title: title || 'Unknown', notes };
}

module.exports = { parseAbc, SCALE, SCALE_MIDI, MIDI_NAMES };
