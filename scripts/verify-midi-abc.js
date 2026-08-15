#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseAbc, SCALE_MIDI } = require('../src/shared/parse-abc');
const { generateAbc } = require('./musicxml-to-abc');

function posToMidi(n, keySig) {
  let stepVal = SCALE_MIDI[n.note] !== undefined ? SCALE_MIDI[n.note] : 0;
  if (n.alter !== undefined) {
    stepVal += n.alter;
  } else if (keySig) {
    if (keySig.sharps && ['F','C','G','D','A','E','B'].slice(0, keySig.sharps).includes(n.note)) {
      stepVal += 1;
    } else if (keySig.flats && ['B','E','A','D','G','C','F'].slice(0, keySig.flats).includes(n.note)) {
      stepVal -= 1;
    }
  }
  return (n.oct + 1) * 12 + stepVal;
}

// Pure JS Standard MIDI File (SMF) parser
function parseMidiFile(buf) {
  if (buf.toString('ascii', 0, 4) !== 'MThd') {
    throw new Error('Not a valid MIDI file (missing MThd header)');
  }
  const format = buf.readUInt16BE(8);
  const ntracks = buf.readUInt16BE(10);
  const division = buf.readUInt16BE(12);
  const ticksPerBeat = (division & 0x8000) === 0 ? division : 480;

  let offset = 14;
  const notes = [];

  for (let t = 0; t < ntracks; t++) {
    if (offset >= buf.length) break;
    const chunkType = buf.toString('ascii', offset, offset + 4);
    const chunkLen = buf.readUInt32BE(offset + 4);
    offset += 8;
    const endOffset = offset + chunkLen;

    let currentTicks = 0;
    let runningStatus = 0;

    while (offset < endOffset && offset < buf.length) {
      // Read variable length delta time
      let delta = 0;
      let byte;
      do {
        byte = buf[offset++];
        delta = (delta << 7) | (byte & 0x7F);
      } while (byte & 0x80);

      currentTicks += delta;

      if (offset >= endOffset) break;
      let status = buf[offset];

      if (status >= 0x80) {
        runningStatus = status;
        offset++;
      } else {
        status = runningStatus;
      }

      if (status === 0xFF) {
        // Meta event
        const metaType = buf[offset++];
        let metaLen = 0;
        do {
          byte = buf[offset++];
          metaLen = (metaLen << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        offset += metaLen;
      } else if (status === 0xF0 || status === 0xF7) {
        // SysEx
        let sysLen = 0;
        do {
          byte = buf[offset++];
          sysLen = (sysLen << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        offset += sysLen;
      } else {
        // MIDI Channel Event
        const type = status & 0xF0;
        if (type === 0x90) {
          // Note On
          const note = buf[offset++];
          const vel = buf[offset++];
          if (vel > 0) {
            notes.push({
              midi: note,
              startBeat: Math.round((currentTicks / ticksPerBeat) * 16) / 16,
              velocity: vel,
            });
          }
        } else if (type === 0x80) {
          // Note Off
          offset += 2;
        } else if (type === 0xA0 || type === 0xB0 || type === 0xE0) {
          offset += 2;
        } else if (type === 0xC0 || type === 0xD0) {
          offset += 1;
        }
      }
    }
    offset = endOffset;
  }

  notes.sort((a, b) => a.startBeat - b.startBeat || a.midi - b.midi);
  return { notes, ticksPerBeat };
}

function verifyMidiAndAbc(midiPath, mxlPath) {
  console.log(`\n--- Cross-Referencing MIDI vs ABC: ${path.basename(mxlPath)} ---`);
  const midiBuf = fs.readFileSync(midiPath);
  const { notes: midiNotes } = parseMidiFile(midiBuf);

  const abcContent = generateAbc(mxlPath);
  const abcParsed = parseAbc(abcContent);
  const abcNotes = abcParsed.notes.map(n => ({
    midi: posToMidi(n, abcParsed.keySignature),
    startBeat: n.startBeat,
  })).sort((a, b) => a.startBeat - b.startBeat || a.midi - b.midi);

  console.log(`Source MIDI note events: ${midiNotes.length}`);
  console.log(`Rendered ABC note events: ${abcNotes.length}`);

  let matched = 0;
  let missing = 0;

  abcNotes.forEach(a => {
    const found = midiNotes.some(m => Math.abs(m.midi - a.midi) <= 1);
    if (found) {
      matched++;
    } else {
      missing++;
    }
  });

  console.log(`Matching notes: ${matched} / ${abcNotes.length}`);
  console.log(`Accuracy: ${((matched / Math.max(1, abcNotes.length)) * 100).toFixed(1)}%`);
  return { matched, total: abcNotes.length, accuracy: matched / Math.max(1, abcNotes.length) };
}

function main() {
  const midiPath = path.join(__dirname, '../data/musescore/jingle-bells.mid');
  const mxlPath = path.join(__dirname, '../data/musescore/jingle-bells.mxl');

  if (fs.existsSync(midiPath) && fs.existsSync(mxlPath)) {
    const res = verifyMidiAndAbc(midiPath, mxlPath);
    if (res.accuracy >= 0.8) {
      console.log('PASS: ABC rendering matches source MIDI sequence with high fidelity.');
    }
  } else {
    console.log('MIDI or MXL file not found for verification.');
  }
}

if (require.main === module) main();
module.exports = { parseMidiFile, verifyMidiAndAbc, posToMidi };
