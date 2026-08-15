#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseAbc, SCALE_MIDI } = require('../src/shared/parse-abc');
const { generateAbc } = require('./musicxml-to-abc');

function posToMidi(n, keySig) {
  if (typeof n.midi === 'number') return n.midi;
  let stepVal = SCALE_MIDI[n.note] !== undefined ? SCALE_MIDI[n.note] : 0;
  if (n.alter !== undefined) {
    stepVal += n.alter;
  } else if (keySig) {
    if (keySig.sharps && ['F', 'C', 'G', 'D', 'A', 'E', 'B'].slice(0, keySig.sharps).includes(n.note)) {
      stepVal += 1;
    } else if (keySig.flats && ['B', 'E', 'A', 'D', 'G', 'C', 'F'].slice(0, keySig.flats).includes(n.note)) {
      stepVal -= 1;
    }
  }
  return (n.oct + 1) * 12 + stepVal;
}

function readVarLen(buf, offset) {
  let value = 0;
  let byte;
  do {
    byte = buf[offset++];
    value = (value << 7) | (byte & 0x7F);
  } while (byte & 0x80);
  return { value, offset };
}

function parseMidiFile(buf) {
  if (buf.toString('ascii', 0, 4) !== 'MThd') {
    throw new Error('Not a valid MIDI file (missing MThd header)');
  }
  const ntracks = buf.readUInt16BE(10);
  const division = buf.readUInt16BE(12);
  const ticksPerBeat = (division & 0x8000) === 0 ? division : 480;

  let offset = 14;
  const notes = [];

  for (let t = 0; t < ntracks; t++) {
    if (offset >= buf.length) break;
    const chunkLen = buf.readUInt32BE(offset + 4);
    offset += 8;
    const endOffset = offset + chunkLen;

    let currentTicks = 0;
    let runningStatus = 0;
    const open = new Map();

    while (offset < endOffset && offset < buf.length) {
      const delta = readVarLen(buf, offset);
      offset = delta.offset;
      currentTicks += delta.value;

      if (offset >= endOffset) break;
      let status = buf[offset];

      if (status >= 0x80) {
        runningStatus = status;
        offset++;
      } else {
        status = runningStatus;
      }

      if (status === 0xFF) {
        offset++;
        const metaLen = readVarLen(buf, offset);
        offset = metaLen.offset + metaLen.value;
      } else if (status === 0xF0 || status === 0xF7) {
        const sysLen = readVarLen(buf, offset);
        offset = sysLen.offset + sysLen.value;
      } else {
        const type = status & 0xF0;
        const channel = status & 0x0F;
        if (type === 0x90 || type === 0x80) {
          const midi = buf[offset++];
          const vel = buf[offset++];
          const isOff = type === 0x80 || vel === 0;
          const key = channel + ':' + midi;
          const startBeat = Math.round((currentTicks / ticksPerBeat) * 16) / 16;
          if (!isOff) {
            const stack = open.get(key) || [];
            stack.push({ midi, startBeat, startTicks: currentTicks, velocity: vel, channel });
            open.set(key, stack);
          } else {
            const stack = open.get(key) || [];
            const started = stack.pop();
            if (started) {
              started.duration = Math.round(((currentTicks - started.startTicks) / ticksPerBeat) * 16) / 16;
              if (started.duration <= 0) started.duration = 0.25;
              notes.push(started);
            }
            if (stack.length === 0) open.delete(key);
          }
        } else if (type === 0xA0 || type === 0xB0 || type === 0xE0) {
          offset += 2;
        } else if (type === 0xC0 || type === 0xD0) {
          offset += 1;
        }
      }
    }

    open.forEach((stack) => {
      stack.forEach((n) => {
        n.duration = n.duration || 0.25;
        notes.push(n);
      });
    });
    offset = endOffset;
  }

  notes.sort((a, b) => a.startBeat - b.startBeat || a.midi - b.midi);
  return { notes, ticksPerBeat };
}

function matchNotes(abcNotes, midiNotes, opts) {
  const startTol = (opts && opts.startTol) != null ? opts.startTol : 0.15;
  const durTol = (opts && opts.durTol) != null ? opts.durTol : 0.25;
  const used = new Set();
  const matches = [];
  const unmatchedAbc = [];

  abcNotes.forEach((a) => {
    let best = -1;
    let bestDt = Infinity;
    for (let i = 0; i < midiNotes.length; i++) {
      if (used.has(i)) continue;
      const m = midiNotes[i];
      if (m.midi !== a.midi) continue;
      const dt = Math.abs(m.startBeat - a.startBeat);
      if (dt > startTol) continue;
      if (dt < bestDt) {
        bestDt = dt;
        best = i;
      }
    }
    if (best === -1) {
      unmatchedAbc.push(a);
      return;
    }
    used.add(best);
    const m = midiNotes[best];
    const durErr = m.duration != null && a.duration != null ? Math.abs(m.duration - a.duration) : null;
    matches.push({
      abc: a,
      midi: m,
      startErr: bestDt,
      durErr,
      durationOk: durErr == null || durErr <= durTol,
    });
  });

  const unmatchedMidi = midiNotes.filter((_, i) => !used.has(i));
  return { matches, unmatchedAbc, unmatchedMidi };
}

function pitchOnlyScore(abcNotes, midiNotes) {
  let matched = 0;
  abcNotes.forEach((a) => {
    if (midiNotes.some((m) => Math.abs(m.midi - a.midi) <= 1)) matched++;
  });
  return matched / Math.max(1, abcNotes.length);
}

function verifyMidiAndAbc(midiPath, mxlPath, opts) {
  const options = opts || {};
  console.log(`\n--- Cross-Referencing MIDI vs ABC: ${path.basename(mxlPath)} ---`);
  const midiBuf = fs.readFileSync(midiPath);
  const { notes: midiNotes } = parseMidiFile(midiBuf);

  const abcContent = generateAbc(mxlPath);
  const abcParsed = parseAbc(abcContent);
  const abcNotes = abcParsed.notes.map((n) => ({
    midi: posToMidi(n, abcParsed.keySignature),
    startBeat: n.startBeat,
    duration: n.duration,
    name: n.note + n.oct,
  })).sort((a, b) => a.startBeat - b.startBeat || a.midi - b.midi);

  const aligned = matchNotes(abcNotes, midiNotes, options);
  const timeMatched = aligned.matches.length;
  const durMatched = aligned.matches.filter((m) => m.durationOk).length;
  const timeAccuracy = timeMatched / Math.max(1, abcNotes.length);
  const durationAccuracy = durMatched / Math.max(1, abcNotes.length);
  const naivePitch = pitchOnlyScore(abcNotes, midiNotes);
  const lastMidi = midiNotes.length ? midiNotes[midiNotes.length - 1].startBeat : 0;
  const lastAbc = abcNotes.length ? abcNotes[abcNotes.length - 1].startBeat : 0;

  console.log(`Source MIDI note events: ${midiNotes.length}`);
  console.log(`Rendered ABC note events: ${abcNotes.length}`);
  console.log(`ABC rests: ${abcParsed.rests.length}`);
  console.log(`Pitch-only (legacy, not used): ${(naivePitch * 100).toFixed(1)}%`);
  console.log(`Pitch+start matches: ${timeMatched} / ${abcNotes.length} (${(timeAccuracy * 100).toFixed(1)}%)`);
  console.log(`Pitch+start+duration: ${durMatched} / ${abcNotes.length} (${(durationAccuracy * 100).toFixed(1)}%)`);
  console.log(`Unmatched ABC: ${aligned.unmatchedAbc.length}  leftover MIDI: ${aligned.unmatchedMidi.length}`);
  console.log(`Last start beat MIDI ${lastMidi} vs ABC ${lastAbc}`);

  return {
    matched: timeMatched,
    total: abcNotes.length,
    restCount: abcParsed.rests.length,
    accuracy: timeAccuracy,
    timeAccuracy,
    durationAccuracy,
    pitchOnlyAccuracy: naivePitch,
    lastStartMidi: lastMidi,
    lastStartAbc: lastAbc,
    unmatchedAbc: aligned.unmatchedAbc,
    unmatchedMidi: aligned.unmatchedMidi,
    abc: abcContent,
    parsed: abcParsed,
  };
}

function siblingPairs(dir) {
  const files = fs.readdirSync(dir);
  const mids = files.filter((f) => f.endsWith('.mid'));
  return mids.map((mid) => {
    const stem = mid.replace(/\.mid$/i, '');
    const mxl = files.find((f) => f === stem + '.mxl' || f === stem + '.musicxml');
    return mxl ? { midiPath: path.join(dir, mid), mxlPath: path.join(dir, mxl), stem } : null;
  }).filter(Boolean);
}

function main() {
  const dataDir = path.join(__dirname, '../data/musescore');
  const pairs = siblingPairs(dataDir);
  if (pairs.length === 0) {
    console.log('No MIDI+MXL sibling pairs found.');
    return;
  }
  let failed = 0;
  pairs.forEach((p) => {
    const res = verifyMidiAndAbc(p.midiPath, p.mxlPath);
    if (res.timeAccuracy < 0.8) {
      console.log(`FAIL: ${p.stem} pitch+start accuracy ${(res.timeAccuracy * 100).toFixed(1)}%`);
      failed++;
    } else {
      console.log(`PASS: ${p.stem} pitch+start accuracy ${(res.timeAccuracy * 100).toFixed(1)}%`);
    }
  });
  if (failed) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { parseMidiFile, verifyMidiAndAbc, posToMidi, matchNotes, siblingPairs, pitchOnlyScore };
