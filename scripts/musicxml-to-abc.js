#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: false,
  isArray: (name) => ['note', 'measure', 'part'].includes(name),
});

const SHARP = { C: '^C', D: '^D', E: '^E', F: '^F', G: '^G', A: '^A', B: '^B' };
const FLAT = { C: '_C', D: '_D', E: '_E', F: '_F', G: '_G', A: '_A', B: '_B' };
const KEY_MAP = {
  '-7': 'Cb', '-6': 'Gb', '-5': 'Db', '-4': 'Ab', '-3': 'Eb', '-2': 'Bb', '-1': 'F',
  '0': 'C',
  '1': 'G', '2': 'D', '3': 'A', '4': 'E', '5': 'B', '6': 'F#', '7': 'C#'
};

function noteToAbc(step, alter, octave) {
  let letter = step;
  if (alter && alter !== '0') {
    const a = parseInt(alter);
    if (a === 1) letter = '^' + letter;
    else if (a === -1) letter = '_' + letter;
    else if (a === 2) letter = '^^' + letter;
    else if (a === -2) letter = '__' + letter;
  }
  const o = parseInt(octave);
  if (o >= 5) {
    letter = letter.toLowerCase();
    letter += "'".repeat(o - 5);
  } else {
    letter += ",".repeat(Math.max(0, 4 - o));
  }
  return letter;
}

function durationToAbc(dur, divisions) {
  const beats = dur / divisions;
  const sixteenths = beats * 4;
  if (sixteenths === Math.floor(sixteenths)) {
    const v = Math.floor(sixteenths);
    if (v === 1) return '';
    return String(v);
  }
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const num = Math.round(sixteenths * 16);
  const den = 16;
  const g = gcd(num, den);
  return '/' + String(den / g);
}

function parseMusicXml(xmlString) {
  const doc = parser.parse(xmlString);
  const score = doc['score-partwise'] || doc['score-part'];
  if (!score) throw new Error('Not a valid MusicXML file (no score-partwise)');

  const parts = score.part || [];
  if (parts.length === 0) throw new Error('No parts found in MusicXML');

  const part = parts[0];
  const measures = part.measure || [];
  let divisions = 1;
  let keySig = 0;
  let keyMode = 'major';
  let timeSig = [4, 4];
  let notes = [];

  for (const measure of measures) {
    const attrs = measure.attributes;
    if (attrs) {
      const a = Array.isArray(attrs) ? attrs[0] : attrs;
      if (a.divisions) divisions = parseInt(a.divisions);
      if (a.key) {
        const k = Array.isArray(a.key) ? a.key[0] : a.key;
        if (k.fifths !== undefined) keySig = parseInt(k.fifths);
        if (k.mode) keyMode = k.mode;
      }
      if (a.time) {
        const t = Array.isArray(a.time) ? a.time[0] : a.time;
        if (t.beats && t['beat-type']) {
          timeSig = [parseInt(t.beats), parseInt(t['beat-type'])];
        }
      }
    }

    const measureNotes = measure.note || [];
    for (const note of measureNotes) {
      if (note.rest) {
        let dur = parseInt(note.duration || 1);
        if (note.dot !== undefined) {
          const dots = Array.isArray(note.dot) ? note.dot.length : 1;
          let extra = dur;
          for (let d = 0; d < dots; d++) { extra = Math.floor(extra / 2); dur += extra; }
        }
        notes.push({ type: 'rest', duration: dur });
      } else if (note.pitch) {
        const p = note.pitch;
        const step = p.step;
        const alter = p.alter || '0';
        const octave = p.octave;
        let dur = parseInt(note.duration || 1);
        if (note.dot !== undefined) {
          const dots = Array.isArray(note.dot) ? note.dot.length : 1;
          let extra = dur;
          for (let d = 0; d < dots; d++) { extra = Math.floor(extra / 2); dur += extra; }
        }
        notes.push({
          type: 'note',
          step,
          alter: parseInt(alter),
          octave: parseInt(octave),
          duration: dur,
        });
      }
    }
  }

  return { notes, divisions, keySig, keyMode, timeSig };
}

function generateAbc(inputPath) {
  let xmlString;
  const buf = fs.readFileSync(inputPath);

  if (buf[0] === 0x50 && buf[1] === 0x4B) {
    const tmpDir = fs.mkdtempSync('/tmp/mxl-');
    try {
      execSync(`unzip -o "${inputPath}" -d "${tmpDir}"`, { stdio: 'pipe' });
      const dirs = [tmpDir];
      while (dirs.length > 0) {
        const d = dirs.shift();
        for (const f of fs.readdirSync(d)) {
          const fp = path.join(d, f);
          if (fs.statSync(fp).isDirectory()) { dirs.push(fp); continue; }
          if (fp.endsWith('.xml') || fp.endsWith('.musicxml')) {
            xmlString = fs.readFileSync(fp, 'utf-8');
            break;
          }
        }
        if (xmlString) break;
      }
      if (!xmlString) throw new Error('No XML found inside MXL archive');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  } else {
    xmlString = buf.toString('utf-8');
  }

  const { notes, divisions, keySig, keyMode, timeSig } = parseMusicXml(xmlString);
  const title = path.basename(inputPath, path.extname(inputPath));

  let keyName = KEY_MAP[keySig] || 'C';
  if (keyMode === 'minor') keyName += 'm';

  let abc = `X:1\nT:${title}\nM:${timeSig[0]}/${timeSig[1]}\nL:1/16\nK:${keyName}\n`;

  let barCount = 0;
  let beatPos = 0;
  const beatsPerBar = timeSig[0];
  const beatUnit = timeSig[1];

  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    if (n.type === 'rest') {
      const len = durationToAbc(n.duration, divisions);
      abc += 'z' + len + ' ';
      beatPos += n.duration / divisions;
    } else {
      const abcNote = noteToAbc(n.step, n.alter, n.octave);
      const len = durationToAbc(n.duration, divisions);
      abc += abcNote + len + ' ';
      beatPos += n.duration / divisions;
    }

    if (beatPos >= beatsPerBar && (i + 1 < notes.length)) {
      abc = abc.trimRight() + ' |\n';
      beatPos = 0;
      barCount++;
    }
  }

  if (beatPos > 0) {
    abc = abc.trimRight() + ' |]\n';
  } else {
    abc = abc.trimRight() + '\n';
  }

  return abc;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/musicxml-to-abc.js <input.musicxml|input.mxl> [output.abc]');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  if (!fs.existsSync(inputPath)) {
    console.error('File not found:', inputPath);
    process.exit(1);
  }

  const abc = generateAbc(inputPath);

  if (args[1]) {
    const outputPath = path.resolve(args[1]);
    fs.writeFileSync(outputPath, abc);
    console.log('Written to', outputPath);
  } else {
    console.log(abc);
  }
}

if (require.main === module) main();
module.exports = { parseMusicXml, generateAbc, noteToAbc, durationToAbc, KEY_MAP };
