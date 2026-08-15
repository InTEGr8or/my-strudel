#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { XMLParser } = require('fast-xml-parser');

const KEY_MAP = {
  '-7': 'Cb', '-6': 'Gb', '-5': 'Db', '-4': 'Ab', '-3': 'Eb', '-2': 'Bb', '-1': 'F',
  '0': 'C',
  '1': 'G', '2': 'D', '3': 'A', '4': 'E', '5': 'B', '6': 'F#', '7': 'C#'
};

function noteToAbc(step, alter, octave) {
  let letter = step;
  if (alter && alter !== 0) {
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

function beatsToAbc(durInBeats) {
  const sixteenths = durInBeats * 4;
  const rounded = Math.round(sixteenths * 32) / 32;
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    const v = Math.round(rounded);
    if (v === 1) return '';
    return String(v);
  }
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const num = Math.round(rounded * 32);
  const den = 32;
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (n === 1) return '/' + d;
  return n + '/' + d;
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
          if ((fp.endsWith('.xml') || fp.endsWith('.musicxml')) && !fp.includes('container.xml')) {
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

  const parserOrder = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    preserveOrder: true,
  });

  const doc = parserOrder.parse(xmlString);
  const scoreNode = doc.find(n => n['score-partwise'] || n['score-part']);
  const score = scoreNode['score-partwise'] || scoreNode['score-part'];
  const partNode = score.find(n => n.part);
  const part = partNode ? partNode.part : [];

  let divisions = 1;
  let keySig = 0;
  let keyMode = 'major';
  let timeSig = [4, 4];
  let soundTempo = null;
  const soundMatch = xmlString.match(/<sound[^>]*tempo="([\d\.]+)"/i);
  if (soundMatch) {
    soundTempo = Math.round(parseFloat(soundMatch[1]));
  } else {
    const pmMatch = xmlString.match(/<per-minute>([\d\.]+)<\/per-minute>/i);
    if (pmMatch) {
      soundTempo = Math.round(parseFloat(pmMatch[1]));
    }
  }

  const measuresData = [];

  for (const mNode of part) {
    if (!mNode.measure) continue;
    const mEls = mNode.measure;
    let currentBeat = 0;
    let lastNoteBeat = 0;
    const measureEvs = [];

    for (const el of mEls) {
      const key = Object.keys(el).find(k => k !== ':@');
      if (key === 'attributes') {
        for (const sub of el.attributes) {
          if (sub.divisions) divisions = parseInt(sub.divisions[0]['#text']);
          if (sub.key) {
            for (const kSub of sub.key) {
              if (kSub.fifths) keySig = parseInt(kSub.fifths[0]['#text']);
              if (kSub.mode) keyMode = kSub.mode[0]['#text'];
            }
          }
          if (sub.time) {
            let beats = 4, beatType = 4;
            for (const tSub of sub.time) {
              if (tSub.beats) beats = parseInt(tSub.beats[0]['#text']);
              if (tSub['beat-type']) beatType = parseInt(tSub['beat-type'][0]['#text']);
            }
            timeSig = [beats, beatType];
          }
        }
      } else if (key === 'backup') {
        let durRaw = 0;
        for (const sub of el.backup) {
          if (sub.duration) durRaw = parseInt(sub.duration[0]['#text']);
        }
        currentBeat -= durRaw / divisions;
      } else if (key === 'forward') {
        let durRaw = 0;
        for (const sub of el.forward) {
          if (sub.duration) durRaw = parseInt(sub.duration[0]['#text']);
        }
        currentBeat += durRaw / divisions;
      } else if (key === 'note') {
        let isRest = false;
        let isChord = false;
        let isGrace = false;
        let durRaw = 1;
        let pitch = null;
        let typeStr = '';
        let staff = 1;
        let voice = 1;
        let tieStart = false;
        let tieStop = false;

        function readTieType(node) {
          if (!node) return;
          const attrs = node[':@'] || {};
          const t = attrs['@_type'] || attrs.type;
          if (t === 'start') tieStart = true;
          if (t === 'stop') tieStop = true;
        }

        for (const sub of el.note) {
          const subKey = Object.keys(sub).find(k => k !== ':@');
          if (subKey === 'rest') isRest = true;
          if (subKey === 'chord') isChord = true;
          if (subKey === 'grace') isGrace = true;
          if (subKey === 'type' && sub.type && sub.type[0]) typeStr = sub.type[0]['#text'];
          if (subKey === 'duration' && sub.duration && sub.duration[0]) {
            durRaw = parseInt(sub.duration[0]['#text']);
          }
          if (subKey === 'staff' && sub.staff && sub.staff[0]) staff = parseInt(sub.staff[0]['#text']);
          if (subKey === 'voice' && sub.voice && sub.voice[0]) voice = parseInt(sub.voice[0]['#text']);
          if (subKey === 'tie') readTieType(sub);
          if (subKey === 'notations' && sub.notations) {
            for (const nSub of sub.notations) {
              const nKey = Object.keys(nSub).find(k => k !== ':@');
              if (nKey === 'tied') readTieType(nSub);
            }
          }
          if (subKey === 'pitch') {
            let step = 'C', alter = 0, octave = 4;
            for (const pSub of sub.pitch) {
              const pKey = Object.keys(pSub).find(k => k !== ':@');
              if (pKey === 'step') step = pSub.step[0]['#text'];
              if (pKey === 'alter') alter = parseInt(pSub.alter[0]['#text']);
              if (pKey === 'octave') octave = parseInt(pSub.octave[0]['#text']);
            }
            pitch = { step, alter, octave };
          }
        }

        if (isGrace) continue;

        // MusicXML <duration> is already the performed length, including dots.
        let durInBeats = durRaw / divisions;
        durInBeats = Math.round(durInBeats * 16) / 16;
        if (durInBeats <= 0) durInBeats = 0.25;

        let noteBeat;
        if (isChord) {
          noteBeat = lastNoteBeat;
        } else {
          noteBeat = Math.round(currentBeat * 16) / 16;
          lastNoteBeat = noteBeat;
          currentBeat += durInBeats;
        }

        const ev = {
          type: isRest ? 'rest' : 'note',
          pitch,
          durInBeats,
          noteBeat,
          staff,
          voice,
          tieStart,
          tieStop,
          typeStr,
        };

        if (isRest) {
          measureEvs.push(ev);
        } else if (pitch) {
          measureEvs.push(ev);
        }
      }
    }
    measuresData.push(measureEvs);
  }

  let title = '';
  const workNode = score.find(n => n.work);
  if (workNode && workNode.work) {
    const wtNode = workNode.work.find(n => n['work-title']);
    if (wtNode && wtNode['work-title'] && wtNode['work-title'][0]) {
      title = wtNode['work-title'][0]['#text'];
    }
  }
  if (!title) {
    const mtNode = score.find(n => n['movement-title']);
    if (mtNode && mtNode['movement-title'] && mtNode['movement-title'][0]) {
      title = mtNode['movement-title'][0]['#text'];
    }
  }
  if (!title) {
    const creditNodes = score.filter(n => n.credit);
    for (const cn of creditNodes) {
      if (!cn.credit) continue;
      const cwNode = cn.credit.find(n => n['credit-words']);
      if (cwNode && cwNode['credit-words'] && cwNode['credit-words'][0] && cwNode['credit-words'][0]['#text']) {
        const text = cwNode['credit-words'][0]['#text'].trim();
        if (text && text.length > 1 && !/^\d+$/.test(text)) {
          title = text;
          break;
        }
      }
    }
  }
  if (!title) {
    title = path.basename(inputPath, path.extname(inputPath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  let keyName = KEY_MAP[keySig] || 'C';
  if (keyMode === 'minor') keyName += 'm';

  let abc = `X:1\nT:${title}\nM:${timeSig[0]}/${timeSig[1]}\nL:1/16\n`;
  if (soundTempo) {
    abc += `Q:1/4=${soundTempo}\n`;
  }
  abc += `K:${keyName}\n`;

  for (let mIdx = 0; mIdx < measuresData.length; mIdx++) {
    const measureEvs = measuresData[mIdx];
    if (measureEvs.length === 0) continue;

    const byVoice = {};
    measureEvs.forEach((e) => {
      const k = `${e.staff || 1}:${e.voice || 1}`;
      (byVoice[k] = byVoice[k] || []).push(e);
    });
    const voiceKeys = Object.keys(byVoice).sort((a, b) => {
      const [s1, v1] = a.split(':').map(Number);
      const [s2, v2] = b.split(':').map(Number);
      return s1 - s2 || v1 - v2;
    });
    const mAbc = voiceKeys.map((k) => emitVoiceAbc(byVoice[k])).filter(Boolean).join(' & ');

    if (mAbc.trim().length > 0) {
      abc += mAbc.trimRight() + (mIdx < measuresData.length - 1 ? ' |\n' : ' |]\n');
    }
  }

  return abc;
}

function emitVoiceAbc(evs) {
  if (!evs || evs.length === 0) return '';
  const groups = {};
  evs.forEach((e) => {
    const k = String(e.noteBeat);
    (groups[k] = groups[k] || []).push(e);
  });
  const sortedBeats = Object.keys(groups).sort((a, b) => parseFloat(a) - parseFloat(b));
  let cursor = 0;
  let out = '';

  sortedBeats.forEach((bKey) => {
    const beat = parseFloat(bKey);
    if (beat > cursor + 0.001) {
      out += 'z' + beatsToAbc(beat - cursor) + ' ';
      cursor = beat;
    }
    const atBeat = groups[bKey];
    const noteEvs = atBeat.filter((e) => e.type === 'note' && e.pitch);
    const restEvs = atBeat.filter((e) => e.type === 'rest');

    if (noteEvs.length > 1) {
      const maxDur = Math.max(...noteEvs.map((n) => n.durInBeats));
      const sameDur = noteEvs.every((n) => Math.abs(n.durInBeats - noteEvs[0].durInBeats) < 0.001);
      const tie = noteEvs.some((n) => n.tieStart) ? '-' : '';
      if (sameDur) {
        const len = beatsToAbc(noteEvs[0].durInBeats);
        const chordPitches = noteEvs.map((n) => noteToAbc(n.pitch.step, n.pitch.alter, n.pitch.octave)).join('');
        out += '[' + chordPitches + ']' + len + tie + ' ';
      } else {
        const chordPitches = noteEvs.map((n) => (
          noteToAbc(n.pitch.step, n.pitch.alter, n.pitch.octave) + beatsToAbc(n.durInBeats)
        )).join('');
        out += '[' + chordPitches + ']' + tie + ' ';
      }
      cursor = beat + maxDur;
    } else if (noteEvs.length === 1) {
      const n = noteEvs[0];
      const len = beatsToAbc(n.durInBeats);
      const tie = n.tieStart ? '-' : '';
      out += noteToAbc(n.pitch.step, n.pitch.alter, n.pitch.octave) + len + tie + ' ';
      cursor = beat + n.durInBeats;
    } else if (restEvs.length > 0) {
      const r = restEvs[0];
      out += 'z' + beatsToAbc(r.durInBeats) + ' ';
      cursor = beat + r.durInBeats;
    }
  });

  return out.trimRight();
}

function parseMusicXml(xmlString) {
  // Legacy signature wrapper for compatibility
  const tmpPath = path.join('/tmp', 'temp-' + Date.now() + '.xml');
  fs.writeFileSync(tmpPath, xmlString);
  try {
    const abc = generateAbc(tmpPath);
    const { parseAbc } = require('../src/shared/parse-abc');
    return parseAbc(abc);
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
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
module.exports = { parseMusicXml, generateAbc, noteToAbc, beatsToAbc, emitVoiceAbc, KEY_MAP };
