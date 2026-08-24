const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { noteName } = require('../src/js/piano-diagram');

console.log('Testing playable piano diagrams...');

assert.strictEqual(noteName(60), 'c4');
assert.strictEqual(noteName(62), 'd4');
assert.strictEqual(noteName(57), 'a3');
assert.strictEqual(noteName(56), 'gs3');

const dKey = fs.readFileSync(path.join(__dirname, '../src/piano-d-key.svg'), 'utf-8');
assert.ok(dKey.includes('class="piano-diagram piano-d-key"'), 'D diagram is a piano-diagram');
assert.ok(dKey.includes('data-midi="60"'), 'D diagram has C4');
assert.ok(dKey.includes('data-midi="62"'), 'D diagram has D4');
assert.ok(dKey.includes('data-midi="64"'), 'D diagram has E4');
assert.ok(dKey.includes('data-midi="61"'), 'D diagram has C#4');
assert.ok(dKey.includes('data-midi="63"'), 'D diagram has D#4');
assert.strictEqual((dKey.match(/data-midi="/g) || []).length, 5, 'C D E plus two black keys');

const ag = fs.readFileSync(path.join(__dirname, '../src/piano-a-to-g.svg'), 'utf-8');
assert.ok(ag.includes('class="piano-diagram piano-a-to-g"'), 'A-to-G diagram is a piano-diagram');
assert.ok(ag.includes('data-midi="57"'), 'A3 is the first white key');
assert.ok(ag.includes('data-midi="67"'), 'G4 is the last white key');
assert.ok(ag.includes('data-midi="56"'), 'half G# on the left is G#3');
assert.ok(ag.includes('data-midi="68"'), 'half G# on the right is G#4');
assert.strictEqual((ag.match(/data-midi="/g) || []).length, 13, 'seven whites plus six blacks');

const src = fs.readFileSync(path.join(__dirname, '../src/js/piano-diagram.js'), 'utf-8');
assert.ok(src.includes('playMidiNote'), 'diagram keys share the page synth');
assert.ok(src.includes('keyOn'), 'diagram keys light the bottom piano');
assert.ok(src.includes('button.play-note'), 'scale-table letters use the same tap-to-play binding');

const layout = fs.readFileSync(path.join(__dirname, '../src/_includes/layout.njk'), 'utf-8');
assert.ok(layout.includes('piano-diagram.js'), 'layout loads the diagram player');

const cfg = fs.readFileSync(path.join(__dirname, '../eleventy.config.js'), 'utf-8');
assert.ok(cfg.includes('pianoDiagram'), 'a shortcode inlines the SVG so keys can be clicked');

console.log('PASS: piano diagrams have playable keys and share the page synth');
console.log('\nAll piano-diagram tests PASSED.');
