const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../src/shared/parse-abc');
const { collectAbcNoteSpans, highlightAbc } = require('../src/js/abc-highlight');

const root = path.join(__dirname, '..');

console.log('Testing ABC source viewer and highlighting...');

const simple = 'X:1\nT:Span\nM:4/4\nL:1/4\nK:C\nC D E F |\n';
const parsed = parseAbc(simple);
assert.ok(parsed.notes.length >= 4, 'parses four notes');
assert.ok(parsed.notes.every(function (n) { return typeof n.srcStart === 'number'; }), 'each note has a source span');
assert.strictEqual(simple.slice(parsed.notes[0].srcStart, parsed.notes[0].srcStart + 1).toUpperCase(), 'C');
assert.strictEqual(simple.slice(parsed.notes[1].srcStart, parsed.notes[1].srcStart + 1).toUpperCase(), 'D');
const html = highlightAbc(simple);
assert.ok(html.includes('abc-header-key'), 'headers are highlighted');
assert.ok(html.includes('data-src-start="' + parsed.notes[0].srcStart + '"'), 'highlighted notes carry parser offsets');
assert.ok(html.includes('abc-note'), 'notes have an abc-note class');
assert.ok(html.includes('abc-bar'), 'bar lines are highlighted');
console.log('PASS: parser offsets match highlighter spans');

const macPath = path.join(root, 'src/songs/sketches/old-macdonald/song.abc');
const mac = fs.readFileSync(macPath, 'utf-8');
const macParsed = parseAbc(mac);
const macSpans = collectAbcNoteSpans(mac);
assert.ok(macParsed.notes.length > 10, 'Old MacDonald has notes');
assert.ok(macSpans.length >= macParsed.notes.length, 'at least one source token per parsed note');
const withSpan = macParsed.notes.filter(function (n) { return n.srcStart != null; }).length;
assert.ok(withSpan / macParsed.notes.length > 0.9, 'most notes map onto ABC tokens');
console.log('PASS: Old MacDonald notes map onto ABC source');

const layout = fs.readFileSync(path.join(root, 'src/_includes/layout.njk'), 'utf-8');
assert.ok(layout.indexOf('abc-source.njk') < layout.indexOf('piano.njk'), 'ABC viewer sits above the keyboard');
assert.strictEqual(layout.includes('showAbcPanel'), true, 'ABC viewer is gated to ABC pages');

const head = fs.readFileSync(path.join(root, 'src/_includes/components/head.njk'), 'utf-8');
assert.strictEqual(head.includes('abc-highlight.js'), true, 'first-party ABC highlighter, no extra CDN');
assert.strictEqual(head.includes('abc-source.js'), true);

const panel = fs.readFileSync(path.join(root, 'src/_includes/components/abc-source.njk'), 'utf-8');
assert.strictEqual(panel.includes('data-abc-toggle'), true, 'Show ABC switch is on the viewer');
assert.strictEqual(panel.includes('toggleAbcSource'), true, 'viewer toggle calls toggleAbcSource');
assert.strictEqual(panel.includes('id="abc-expand-toggle"'), true, 'viewer can expand');

const css = fs.readFileSync(path.join(root, 'src/css/trainer.css'), 'utf-8');
assert.strictEqual(css.includes('max-height: 200px'), true, 'collapsed viewer is 200px');
assert.strictEqual(css.includes('abc-current'), true);

const tape = fs.readFileSync(path.join(root, 'src/js/tape-trainer.js'), 'utf-8');
assert.strictEqual(tape.includes('__abcCursorBeat'), true, 'tape only publishes the current beat');
assert.strictEqual(tape.includes('syncAbcCursor'), false, 'tape never calls the highlighter');
const srcJs = fs.readFileSync(path.join(root, 'src/js/abc-source.js'), 'utf-8');
assert.strictEqual(srcJs.includes('requestIdleCallback'), true, 'highlighter waits for idle time');
assert.strictEqual(srcJs.includes('STORAGE_SYNC'), true, 'sync is a separate opt-in');
assert.strictEqual(panel.includes('abc-sync-toggle'), true, 'toolbar has a Sync switch');

const songsSrc = fs.readFileSync(path.join(root, 'src/_data/sightReadingSongs.js'), 'utf-8');
assert.strictEqual(songsSrc.includes('abc: text'), true, 'songs.json carries the ABC source');

const trainerPage = fs.readFileSync(path.join(root, 'src/songs/sketches/sight-reading/index.md'), 'utf-8');
assert.strictEqual(trainerPage.includes('setAbcSource(song.abc'), true, 'song changes update the ABC viewer');

console.log('PASS: ABC viewer is on ABC pages, above the piano, and tracks the tape head');
console.log('\nAll ABC source viewer tests PASSED.');
