const assert = require('assert');
const { createTrainerStore } = require('../src/js/trainer-store');
const { computeStaffLayout } = require('../src/js/staff-layout');

console.log('Testing trainer store and staff layout...');

const store = createTrainerStore({ playing: true, bpm: 80, songTitle: 'Jingle Bells' });
assert.strictEqual(store.get().playing, true);
assert.strictEqual(store.get().songTitle, 'Jingle Bells');

let seen = null;
const unsub = store.subscribe(function (state, prev) {
  seen = { playing: state.playing, prevPlaying: prev.playing, songTitle: state.songTitle };
});

store.set({ songTitle: 'Moonlight Sonata', playing: false, bpm: 54, tempo: 54 });
assert.strictEqual(store.get().playing, false, 'song change must clear playing');
assert.strictEqual(store.get().songTitle, 'Moonlight Sonata');
assert.strictEqual(seen.playing, false);
assert.strictEqual(seen.prevPlaying, true, 'subscribers see the previous playing flag');
unsub();

store.set({ playing: true });
let afterUnsub = 0;
store.subscribe(function () { afterUnsub += 1; });
// previous listener must not fire
seen = null;
store.set({ playing: false });
assert.strictEqual(seen, null, 'unsubscribed listener does not run');
assert.strictEqual(afterUnsub, 1);

console.log('PASS: trainer store resets playing on song change and notifies subscribers');

const layout = computeStaffLayout(1);
assert.strictEqual(layout.LEFT_MARGIN, 50, '50px left of the staff');
assert.strictEqual(layout.BOT_EXTRA, 75, '75 extra pixels below the staff');
assert.ok(layout.BOT_PAD >= 80 + 75, `BOT_PAD is ${layout.BOT_PAD}, expected >= 155`);
assert.ok(layout.keyX < layout.clefX, `key column x ${layout.keyX} must be left of clef x ${layout.clefX}`);
assert.ok(layout.clefX < layout.timeX, `clef x ${layout.clefX} must be left of time x ${layout.timeX}`);
assert.ok(layout.timeX < layout.COLOR_X, 'time signature left of color guide');
assert.ok(layout.COLOR_X < layout.LEFT_PAD, 'color guide left of note content');
assert.ok(layout.LEFT_PAD - layout.clefX >= layout.KEY_COL_W, 'key column width is reflected in content offset');
assert.strictEqual(layout.STAFF_L, 50, 'staff lines start after the 50px left margin');

const scaled = computeStaffLayout(2);
assert.strictEqual(scaled.LEFT_MARGIN, 100);
assert.strictEqual(scaled.BOT_EXTRA, 150);
assert.ok(scaled.keyX < scaled.clefX);

console.log('PASS: staff layout has 50px left margin, +75px below, key column left of clef');
console.log('\nAll trainer store & staff layout tests PASSED.');
