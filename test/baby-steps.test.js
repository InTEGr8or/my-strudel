const assert = require('assert');
const {
  STEPS,
  STORAGE_KEY,
  generateBabyStep,
  nextBabyStep,
  markStepComplete,
  isStepComplete,
  resetBabySteps,
} = require('../src/js/baby-steps');
const { fitsKeyboardAbsolute } = require('../src/js/staff-layout');
const fs = require('fs');
const path = require('path');

console.log('Testing baby-steps curriculum...');

function memStore() {
  return {
    _data: {},
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(this._data, k) ? this._data[k] : null; },
    setItem: function (k, v) { this._data[k] = String(v); },
  };
}

assert.strictEqual(STORAGE_KEY, 'baby-steps');
assert.ok(STEPS.length >= 3, 'at least singles, dyads, triads');
assert.strictEqual(STEPS[0].voices, 1);
assert.ok(STEPS.some(function (s) { return s.voices === 2; }));
assert.ok(STEPS.some(function (s) { return s.voices === 3; }));

const singles = generateBabyStep('singles-five-finger');
assert.ok(singles.length >= 10 && singles.length <= 24, 'five-finger is a short single-note drill');
const beats = {};
singles.forEach(function (n) {
  beats[n.startBeat] = (beats[n.startBeat] || 0) + 1;
});
assert.ok(Object.keys(beats).every(function (b) { return beats[b] === 1; }), 'singles never stack two notes');
assert.ok(fitsKeyboardAbsolute(singles, 41, 72), 'five-finger stays on the N32');

const scale = generateBabyStep('singles-scale-walk');
assert.ok(scale.length >= 16, 'scale walk repeats the ascent/descent');
assert.ok(scale.every(function (n, i) {
  return i === 0 || Math.abs(n.startBeat - scale[i - 1].startBeat) >= 0.99;
}), 'scale walk is still one note per beat');

const thirds = generateBabyStep('dyads-thirds');
const thirdBeats = {};
thirds.forEach(function (n) {
  thirdBeats[n.startBeat] = (thirdBeats[n.startBeat] || 0) + 1;
});
assert.ok(Object.keys(thirdBeats).some(function (b) { return thirdBeats[b] === 2; }), 'thirds are two-note columns');
assert.ok(fitsKeyboardAbsolute(thirds, 41, 72));

const triads = generateBabyStep('triads-i-iv-v');
const triadBeats = {};
triads.forEach(function (n) {
  triadBeats[n.startBeat] = (triadBeats[n.startBeat] || 0) + 1;
});
assert.ok(Object.keys(triadBeats).some(function (b) { return triadBeats[b] === 3; }), 'I–IV–V uses three-note columns');
assert.ok(fitsKeyboardAbsolute(triads, 41, 72));

const store = memStore();
assert.strictEqual(nextBabyStep(store).id, 'singles-five-finger');
markStepComplete('singles-five-finger', store);
assert.strictEqual(isStepComplete('singles-five-finger', store), true);
assert.strictEqual(nextBabyStep(store).id, 'singles-scale-walk');
STEPS.forEach(function (s) { markStepComplete(s.id, store); });
assert.strictEqual(nextBabyStep(store), null, 'all named steps can be satisfied');
const saved = JSON.parse(store.getItem('baby-steps'));
assert.strictEqual(saved['singles-five-finger'].completed, true);
resetBabySteps(store);
assert.strictEqual(nextBabyStep(store).id, 'singles-five-finger');
console.log('PASS: named baby-steps persist and skip completed work');

const page = fs.readFileSync(path.join(__dirname, '../src/songs/sketches/sight-reading/index.md'), 'utf-8');
assert.strictEqual(page.includes('trainer.setNotes(null)'), false, 'Random no longer loads an empty tape');
assert.strictEqual(page.includes('applyBabyStep'), true);
const tape = fs.readFileSync(path.join(__dirname, '../src/js/tape-trainer.js'), 'utf-8');
assert.strictEqual(tape.includes('generateBabyStep'), true, 'empty tape falls back to baby-step notes');
assert.strictEqual(page.includes('markBabyStepComplete'), true);
assert.strictEqual(page.includes('onExerciseComplete'), true);
const head = fs.readFileSync(path.join(__dirname, '../src/_includes/components/head.njk'), 'utf-8');
assert.strictEqual(head.includes('baby-steps.js'), true, 'baby-steps.js is loaded on trainer pages');
console.log('PASS: Random on the sight-reading trainer plays the next unfinished baby step');

console.log('\nAll baby-steps tests PASSED.');
