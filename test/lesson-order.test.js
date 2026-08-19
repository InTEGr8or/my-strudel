const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { sortLessons, lessonOrder } = require('../src/shared/lesson-order');

console.log('Testing lesson list order...');

const mixed = [
  { data: { type: 'song', title: 'A song' } },
  { data: { type: 'lesson', title: 'C Major Scale', order: 1 } },
  { data: { type: 'lesson', title: 'Notes, intervals, and scale degrees', order: 0 } },
  { data: { type: 'lesson', title: 'A Minor Scale', order: 2 } },
];
const sorted = sortLessons(mixed);
assert.strictEqual(sorted.length, 3);
assert.strictEqual(sorted[0].data.title, 'Notes, intervals, and scale degrees');
assert.strictEqual(sorted[1].data.title, 'C Major Scale');
assert.strictEqual(sorted[2].data.title, 'A Minor Scale');
assert.strictEqual(lessonOrder({ data: { order: 0 } }), 0, 'order 0 is first, not missing');
assert.strictEqual(lessonOrder({ data: {} }), 999);

const root = path.join(__dirname, '..');
const lessonsDir = path.join(root, 'src', 'lessons');
const pages = fs.readdirSync(lessonsDir).map(function (dir) {
  const file = path.join(lessonsDir, dir, 'index.md');
  const text = fs.readFileSync(file, 'utf-8');
  const orderM = text.match(/^order:\s*(\d+)\s*$/m);
  const titleM = text.match(/^title:\s*"([^"]+)"/m);
  return {
    dir: dir,
    data: {
      type: 'lesson',
      title: titleM ? titleM[1] : dir,
      order: orderM ? parseInt(orderM[1], 10) : undefined,
    },
  };
});
const listed = sortLessons(pages);
assert.ok(listed.length >= 8, 'all current lessons have front matter');
assert.strictEqual(listed[0].dir, 'notes-intervals-degrees', 'foundations folder stays un-numbered');
assert.strictEqual(listed[0].data.order, 0);

const home = fs.readFileSync(path.join(root, 'src/index.njk'), 'utf-8');
assert.strictEqual(home.includes('lessonPages'), true, 'dashboard uses the lesson filter');
assert.strictEqual(home.includes("sort(false, false, 'data.order')"), false, 'dashboard does not sort the whole site');

const eleventy = fs.readFileSync(path.join(root, 'eleventy.config.js'), 'utf-8');
assert.strictEqual(eleventy.includes('sortLessons'), true);

console.log('PASS: lessons sort by front-matter order, foundations first');
console.log('\nAll lesson-order tests PASSED.');
