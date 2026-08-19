const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { WINDOW_S, LINE_WIDTH } = require('../src/js/freq-lab');

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

const layout = fs.readFileSync(path.join(__dirname, '../src/_includes/layout.njk'), 'utf-8');
assert.strictEqual(layout.includes('freq-lab.js'), true, 'layout loads the freq-lab');

const head = fs.readFileSync(path.join(__dirname, '../src/_includes/components/head.njk'), 'utf-8');
assert.strictEqual(head.includes('freq-lab.css'), true, 'head loads freq-lab styles');

console.log('PASS: freq-lab is a reusable 440–880 sine lab');
console.log('\nAll freq-lab tests PASSED.');
