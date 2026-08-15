const SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const MIDI_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

const SHARP_NOTES = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_NOTES = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
const SHARP_OCT = { F: 5, C: 5, G: 4, D: 5, A: 4, E: 5, B: 4 };
const FLAT_OCT = { B: 4, E: 5, A: 4, D: 5, G: 4, C: 5, F: 5 };

const KEY_SIGS = {
  C: { sharps: 0 }, G: { sharps: 1 }, D: { sharps: 2 }, A: { sharps: 3 },
  E: { sharps: 4 }, B: { sharps: 5 }, 'F#': { sharps: 6 }, 'C#': { sharps: 7 },
  F: { flats: 1 }, Bb: { flats: 2 }, Eb: { flats: 3 }, Ab: { flats: 4 },
  Db: { flats: 5 }, Gb: { flats: 6 }, Cb: { flats: 7 },
};

const MINOR_REL = {
  Am: 'C', Em: 'G', Bm: 'D', 'F#m': 'A', 'C#m': 'E', 'G#m': 'B', 'D#m': 'F#', 'A#m': 'C#',
  Dm: 'F', Gm: 'Bb', Cm: 'Eb', Fm: 'Ab', Bbm: 'Db', Ebm: 'Gb', Abm: 'Cb',
};

function parseKeySig(kStr) {
  if (!kStr) return [];
  let clean = kStr.trim().replace(/\s*(major|maj|minor|min)\b/i, '').trim();
  if (clean.length > 1 && (clean[1] === '#' || clean[1] === 'b')) {
    clean = clean[0].toUpperCase() + clean[1];
  } else if (clean.length > 0) {
    clean = clean[0].toUpperCase() + clean.slice(1);
  }
  const majorKey = MINOR_REL[clean] || clean;
  const info = KEY_SIGS[majorKey];
  if (!info) return [];
  const result = [];
  if (info.sharps) {
    for (let i = 0; i < info.sharps; i++) {
      const note = SHARP_NOTES[i];
      const trebleOct = SHARP_OCT[note];
      result.push({ note, oct: trebleOct, acc: 'sharp' });
      result.push({ note, oct: trebleOct - 2, acc: 'sharp' });
    }
  } else if (info.flats) {
    for (let i = 0; i < info.flats; i++) {
      const note = FLAT_NOTES[i];
      const trebleOct = FLAT_OCT[note];
      result.push({ note, oct: trebleOct, acc: 'flat' });
      result.push({ note, oct: trebleOct - 2, acc: 'flat' });
    }
  }
  return result;
}

function keyLetterAlter(letter, keyStr) {
  if (!keyStr) return 0;
  let clean = keyStr.trim().replace(/\s*(major|maj|minor|min)\b/i, '').trim();
  if (clean.length > 1 && (clean[1] === '#' || clean[1] === 'b')) {
    clean = clean[0].toUpperCase() + clean[1];
  } else if (clean.length > 0) {
    clean = clean[0].toUpperCase() + clean.slice(1);
  }
  const majorKey = MINOR_REL[clean] || clean;
  const info = KEY_SIGS[majorKey];
  if (!info) return 0;
  if (info.sharps && SHARP_NOTES.slice(0, info.sharps).includes(letter)) return 1;
  if (info.flats && FLAT_NOTES.slice(0, info.flats).includes(letter)) return -1;
  return 0;
}

function accidentalToAlter(acc) {
  if (!acc) return null;
  if (acc[0] === '^') return acc.length;
  if (acc[0] === '_') return -acc.length;
  if (acc === '=') return 0;
  return null;
}

function noteToMidi(letter, oct, alter) {
  const stepVal = SCALE_MIDI[letter] !== undefined ? SCALE_MIDI[letter] : 0;
  return (oct + 1) * 12 + stepVal + (alter || 0);
}

function mergeTiedNotes(notes) {
  const result = notes.map((n) => Object.assign({}, n));
  for (let i = 0; i < result.length; i++) {
    let n = result[i];
    if (!n || !n.tie) continue;
    for (let j = i + 1; j < result.length; j++) {
      const nxt = result[j];
      if (!nxt) continue;
      if (nxt.note !== n.note || nxt.oct !== n.oct) continue;
      if ((nxt.alter || 0) !== (n.alter || 0)) continue;
      if (Math.abs(nxt.startBeat - (n.startBeat + n.duration)) > 0.08) continue;
      n.duration += nxt.duration;
      n.tie = !!nxt.tie;
      result[j] = null;
      if (!n.tie) break;
    }
  }
  return result.filter(Boolean).map((n) => {
    const copy = Object.assign({}, n);
    delete copy.tie;
    copy.midi = noteToMidi(copy.note, copy.oct, copy.alter);
    return copy;
  });
}

function parseAbc(text) {
  const lines = text.split('\n');
  let title = '';
  let tempo = null;
  let timeSig = null;
  let defaultLength = 1;
  let keyStr = 'C';
  const bodyLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('T:')) {
      title = trimmed.slice(2).trim();
    } else if (trimmed.startsWith('M:')) {
      const m = trimmed.slice(2).trim();
      const parts = m.split('/');
      if (parts.length === 2) {
        timeSig = { top: parseInt(parts[0], 10), bottom: parseInt(parts[1], 10) };
      }
    } else if (trimmed.startsWith('L:')) {
      const l = trimmed.slice(2).trim();
      const parts = l.split('/');
      if (parts.length === 2) {
        defaultLength = (parseInt(parts[0], 10) / parseInt(parts[1], 10)) * 4;
      }
    } else if (trimmed.startsWith('Q:')) {
      const qStr = trimmed.slice(2).trim();
      const qMatch = qStr.match(/=\s*(\d+)/) || qStr.match(/(\d+)/);
      if (qMatch) {
        tempo = parseInt(qMatch[1] || qMatch[0], 10);
      }
    } else if (trimmed.startsWith('K:')) {
      keyStr = trimmed.slice(2).trim();
    } else if (!/^[A-Z]:/.test(trimmed)) {
      bodyLines.push(trimmed);
    }
  }

  const notes = [];
  const rests = [];
  const events = [];
  const beatsPerBar = timeSig ? timeSig.top : 4;
  const rawMeasures = bodyLines.join('\n').split(/\|+/);
  let currentMeasureStart = 0;
  const tokenRe = /\[(.*?)\](\d*)(\/*)(\d*)(-)?|(\^{1,2}|_{1,2}|=)?([A-Ga-gzZxX])([',]*)(\d*)(\/*)(\d*)(-)?/g;

  function makeNote(letter, markers, duration, beat, acc, tie) {
    let oct = letter === letter.toUpperCase() ? 4 : 5;
    for (const ch of markers) {
      if (ch === "'") oct++;
      else if (ch === ',') oct--;
    }
    if (oct < 1 || oct > 8) return null;
    const name = letter.toUpperCase();
    const explicit = accidentalToAlter(acc);
    const alter = explicit === null ? keyLetterAlter(name, keyStr) : explicit;
    return {
      type: 'note',
      note: name,
      oct,
      alter,
      midi: noteToMidi(name, oct, alter),
      startBeat: beat,
      duration,
      tie: !!tie,
    };
  }

  for (let mRaw of rawMeasures) {
    let mClean = mRaw.replace(/^[A-Z]:.*$/gm, '').replace(/:/g, ' ').trim();
    if (!mClean) continue;

    const voices = mClean.split('&');
    let maxVoiceBeats = 0;

    for (let vStr of voices) {
      let beat = currentMeasureStart;
      tokenRe.lastIndex = 0;
      let m;

      while ((m = tokenRe.exec(vStr)) !== null) {
        if (m[1] !== undefined) {
          const chordContent = m[1];
          const mult = parseInt(m[2] || '1', 10);
          const slashCount = m[3].length;
          const explicitDiv = m[4] ? parseInt(m[4], 10) : 0;
          const divisor = explicitDiv > 0 ? explicitDiv : (slashCount > 0 ? Math.pow(2, slashCount) : 1);
          const baseChordDur = defaultLength * mult / divisor;
          const chordTie = m[5];

          const noteRe = /(\^{1,2}|_{1,2}|=)?([A-Ga-gzZxX])([',]*)(\d*)(\/*)(\d*)(-)?/g;
          let nm;
          let chordNotesCount = 0;
          let maxChordDur = baseChordDur;
          while ((nm = noteRe.exec(chordContent)) !== null) {
            const letter = nm[2];
            const markers = nm[3];
            const nMult = parseInt(nm[4] || '1', 10);
            const nSlash = nm[5].length;
            const nDiv = nm[6] ? parseInt(nm[6], 10) : 0;
            const nDivisor = nDiv > 0 ? nDiv : (nSlash > 0 ? Math.pow(2, nSlash) : 1);
            const nDur = (nm[4] || nm[5] || nm[6]) ? (defaultLength * nMult / nDivisor) : baseChordDur;

            const noteObj = makeNote(letter, markers, nDur, beat, nm[1], nm[7] || chordTie);
            if (!noteObj) continue;
            notes.push(noteObj);
            events.push(noteObj);
            if (nDur > maxChordDur) maxChordDur = nDur;
            chordNotesCount++;
          }
          if (chordNotesCount > 0) {
            beat += maxChordDur;
          }
        } else {
          const letter = m[7];
          if (!letter) continue;

          const multiplier = parseInt(m[9] || '1', 10);
          const slashCount = m[10].length;
          const explicitDiv = m[11] ? parseInt(m[11], 10) : 0;
          const divisor = explicitDiv > 0 ? explicitDiv : (slashCount > 0 ? Math.pow(2, slashCount) : 1);
          const duration = defaultLength * multiplier / divisor;

          if (/^[zZxX]$/.test(letter)) {
            const restObj = { type: 'rest', startBeat: beat, duration };
            rests.push(restObj);
            events.push(restObj);
            beat += duration;
            continue;
          }

          const noteObj = makeNote(letter, m[8], duration, beat, m[6], m[12]);
          if (!noteObj) continue;
          notes.push(noteObj);
          events.push(noteObj);
          beat += duration;
        }
      }
      const vBeats = beat - currentMeasureStart;
      if (vBeats > maxVoiceBeats) maxVoiceBeats = vBeats;
    }
    currentMeasureStart += maxVoiceBeats > 0 ? maxVoiceBeats : beatsPerBar;
  }

  const mergedNotes = mergeTiedNotes(notes);
  const noteId = new Set(mergedNotes.map((n) => n.startBeat + ':' + n.note + ':' + n.oct + ':' + n.duration));
  const mergedEvents = events.map((e) => {
    if (e.type !== 'note') return e;
    return mergedNotes.find((n) => n.startBeat === e.startBeat && n.note === e.note && n.oct === e.oct) || null;
  }).filter(Boolean);
  // Drop events whose notes were absorbed into a tie
  const eventsOut = [];
  const seen = new Set();
  for (const e of mergedEvents) {
    if (e.type === 'rest') {
      eventsOut.push(e);
      continue;
    }
    const k = e.startBeat + ':' + e.note + ':' + e.oct + ':' + e.duration;
    if (seen.has(k)) continue;
    if (!noteId.has(k)) continue;
    seen.add(k);
    eventsOut.push(e);
  }

  const keySignature = parseKeySig(keyStr);

  return { title: title || 'Unknown', tempo, notes: mergedNotes, rests, events: eventsOut, timeSignature: timeSig, keySignature };
}

module.exports = { parseAbc, SCALE, SCALE_MIDI, MIDI_NAMES, noteToMidi, keyLetterAlter, mergeTiedNotes };
