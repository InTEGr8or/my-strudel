const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { WINDOW_S, LINE_WIDTH, hzOfMidi, ticksInRange, isLetterMidi } = require('../src/js/freq-lab');

console.log('Testing freq-lab component...');

assert.strictEqual(WINDOW_S, 0.1, 'scope is a tenth of a second');
assert.strictEqual(LINE_WIDTH, 0.2, 'sine stroke is twice the old 0.1 width');

const src = fs.readFileSync(path.join(__dirname, '../src/js/freq-lab.js'), 'utf-8');
assert.strictEqual(src.includes("customElements.define('freq-lab'"), true, 'freq-lab is a custom element');
assert.strictEqual(src.includes("osc.type = 'sine'"), true, 'lab tone is a sine');
assert.strictEqual(src.includes('press and slide'), true, 'tone can latch for sliding');
assert.strictEqual(src.includes('role="switch"'), true, 'tone control is a switch');
assert.strictEqual(src.includes('LINE_WIDTH'), true);

const css = fs.readFileSync(path.join(__dirname, '../src/css/freq-lab.css'), 'utf-8');
assert.ok(css.includes('freq-lab'), 'component has its own stylesheet');
assert.ok(Math.abs(hzOfMidi(69) - 440) < 0.001, 'A4 is 440 Hz');
assert.ok(Math.abs(hzOfMidi(81) - 880) < 0.001, 'A5 is 880 Hz');
assert.strictEqual(isLetterMidi(69), true, 'A is a letter tick');
assert.strictEqual(isLetterMidi(70), false, 'A♯ is a half-step tick');
const ticks = ticksInRange(440, 880);
assert.strictEqual(ticks.length, 13, 'A4 to A5 is 12 half steps, 13 marks');
assert.strictEqual(
  ticks.filter(function (t) { return t.letter; }).map(function (t) { return t.name; }).join(','),
  'A4,B4,C5,D5,E5,F5,G5,A5',
  'every letter in the A4–A5 octave is a labeled whole-note tick'
);
assert.ok(ticks.some(function (t, i) {
  return i > 0 && t.letter && ticks[i - 1].letter && t.name === 'C5' && ticks[i - 1].name === 'B4';
}), 'B to C has no in-between tick');
assert.ok(ticks.some(function (t, i) {
  return i > 0 && t.letter && ticks[i - 1].letter && t.name === 'F5' && ticks[i - 1].name === 'E5';
}), 'E to F has no in-between tick');
assert.ok(src.includes('freq-tick'), 'the slider ruler is drawn in the lab');
assert.ok(css.includes('freq-tick.half'), 'half-step ticks are shorter');
assert.ok(css.includes('freq-tick.letter'), 'letter ticks are taller');

const layout = fs.readFileSync(path.join(__dirname, '../src/_includes/layout.njk'), 'utf-8');
assert.strictEqual(layout.includes('freq-lab.js'), true, 'layout loads the freq-lab');

const head = fs.readFileSync(path.join(__dirname, '../src/_includes/components/head.njk'), 'utf-8');
assert.strictEqual(head.includes('freq-lab.css'), true, 'head loads freq-lab styles');

console.log('PASS: freq-lab is a reusable 440–880 sine lab');
console.log('\nAll freq-lab tests PASSED.');
