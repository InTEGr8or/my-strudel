const assert = require('assert');
const KeyboardRange = require('../src/js/keyboard-range');

console.log('Testing keyboard-range...');

const n32 = KeyboardRange.byId('32-key');
assert.ok(n32, '32-key preset exists');
assert.strictEqual(n32.low, 41);
assert.strictEqual(n32.high, 72);
assert.strictEqual(n32.notes, 32);
assert.strictEqual(KeyboardRange.DEFAULT_ID, '32-key');
assert.strictEqual(KeyboardRange.get().id, '32-key', 'default range is the 32-key board');

assert.strictEqual(KeyboardRange.isDimmed(40, n32), true, 'E2 is below the N32');
assert.strictEqual(KeyboardRange.isDimmed(41, n32), false, 'F2 is the N32 bottom');
assert.strictEqual(KeyboardRange.isDimmed(72, n32), false, 'C5 is the N32 top');
assert.strictEqual(KeyboardRange.isDimmed(73, n32), true, 'C#5 is above the N32');

const full = KeyboardRange.byId('88-key');
assert.strictEqual(KeyboardRange.isDimmed(21, full), false, 'A0 is on an 88-key');
assert.strictEqual(KeyboardRange.isDimmed(108, full), false, 'C8 is on an 88-key');

const mini = KeyboardRange.byId('25-key');
assert.strictEqual(mini.low, 36);
assert.strictEqual(mini.high, 60);
assert.strictEqual(KeyboardRange.isDimmed(35, mini), true);
assert.strictEqual(KeyboardRange.isDimmed(36, mini), false);
assert.strictEqual(KeyboardRange.isDimmed(61, mini), true);

assert.strictEqual(KeyboardRange.matchMidiName('Donner N32 MIDI Keyboard').id, '32-key');
assert.strictEqual(KeyboardRange.matchMidiName('N-32').id, '32-key', 'n-32 alias');
assert.strictEqual(KeyboardRange.matchMidiName('Yamaha P-125'), null, 'unknown MIDI names are not guessed');

const store = {};
global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};

KeyboardRange.setById('88-key', { persist: true });
assert.strictEqual(KeyboardRange.get().id, '88-key');
assert.strictEqual(store[KeyboardRange.STORAGE_KEY], '88-key');

KeyboardRange.setById('25-key', { persist: false });
assert.strictEqual(KeyboardRange.get().id, '25-key');
assert.strictEqual(store[KeyboardRange.STORAGE_KEY], '88-key', 'persist:false leaves storage alone');

store[KeyboardRange.STORAGE_KEY] = '61-key';
KeyboardRange.restore();
assert.strictEqual(KeyboardRange.get().id, '61-key');
assert.strictEqual(KeyboardRange.get().low, 36);
assert.strictEqual(KeyboardRange.get().high, 96);

delete store[KeyboardRange.STORAGE_KEY];
KeyboardRange.restore();
const suggested = KeyboardRange.suggestFromMidiName('Donner N32');
assert.strictEqual(suggested.id, '32-key');
assert.strictEqual(store[KeyboardRange.STORAGE_KEY], '32-key', 'a known MIDI name is saved when nothing was picked');

store[KeyboardRange.STORAGE_KEY] = '88-key';
KeyboardRange.restore();
KeyboardRange.suggestFromMidiName('Donner N32');
assert.strictEqual(KeyboardRange.get().id, '88-key', 'a saved choice beats MIDI auto-detect');

function fakeKey(midi) {
  var flags = {};
  return {
    getAttribute: function (name) { return name === 'data-midi' ? String(midi) : null; },
    classList: {
      toggle: function (name, on) { flags[name] = !!on; },
      contains: function (name) { return !!flags[name]; },
    },
  };
}

KeyboardRange.setById('32-key', { persist: false });
const keys = [fakeKey(40), fakeKey(41), fakeKey(72), fakeKey(73)];
KeyboardRange.apply({ querySelectorAll: function () { return keys; } });
assert.strictEqual(keys[0].classList.contains('dimmed'), true);
assert.strictEqual(keys[1].classList.contains('dimmed'), false);
assert.strictEqual(keys[2].classList.contains('dimmed'), false);
assert.strictEqual(keys[3].classList.contains('dimmed'), true);

KeyboardRange.setById('88-key', { persist: false });
KeyboardRange.apply({ querySelectorAll: function () { return keys; } });
assert.ok(keys.every(function (k) { return k.classList.contains('dimmed') === false; }), '88-key lights the whole piano');

assert.strictEqual(KeyboardRange.midiDisplay(41), 'F2');
assert.strictEqual(KeyboardRange.midiDisplay(72), 'C5');
assert.strictEqual(KeyboardRange.isCalibrating(), false);

KeyboardRange.startCalibrate();
assert.strictEqual(KeyboardRange.isCalibrating(), true);
assert.strictEqual(KeyboardRange.calibrateState().prompt, KeyboardRange.PROMPT_LOW);
var first = KeyboardRange.hear(41);
assert.strictEqual(first.done, false);
assert.strictEqual(KeyboardRange.calibrateState().low, 41);
assert.strictEqual(KeyboardRange.calibrateState().prompt, KeyboardRange.PROMPT_HIGH);
var same = KeyboardRange.hear(41);
assert.strictEqual(same.done, false, 'the same key is not also the highest');
var done = KeyboardRange.hear(72);
assert.strictEqual(done.done, true);
assert.strictEqual(done.low, 41);
assert.strictEqual(done.high, 72);
assert.strictEqual(KeyboardRange.isCalibrating(), false);
assert.strictEqual(KeyboardRange.get().id, 'custom');
assert.strictEqual(KeyboardRange.get().low, 41);
assert.strictEqual(KeyboardRange.get().high, 72);
assert.strictEqual(KeyboardRange.get().name, 'Yours');
assert.strictEqual(store[KeyboardRange.STORAGE_KEY], 'custom');
assert.ok(store[KeyboardRange.STORAGE_CUSTOM].indexOf('41') !== -1);

KeyboardRange.startCalibrate();
KeyboardRange.hear(72);
var swapped = KeyboardRange.hear(41);
assert.strictEqual(swapped.low, 41, 'high-then-low still becomes the sounding range');
assert.strictEqual(swapped.high, 72);

KeyboardRange.setById('32-key', { persist: true });
KeyboardRange.startCalibrate();
KeyboardRange.hear(50);
KeyboardRange.cancelCalibrate();
assert.strictEqual(KeyboardRange.isCalibrating(), false);
assert.strictEqual(KeyboardRange.get().id, '32-key', 'cancel leaves the previous range');

KeyboardRange.restore();
assert.strictEqual(KeyboardRange.get().id, '32-key');
store[KeyboardRange.STORAGE_KEY] = 'custom';
store[KeyboardRange.STORAGE_CUSTOM] = JSON.stringify({ low: 36, high: 84 });
KeyboardRange.restore();
assert.strictEqual(KeyboardRange.get().id, 'custom');
assert.strictEqual(KeyboardRange.get().low, 36);
assert.strictEqual(KeyboardRange.get().high, 84);
assert.strictEqual(KeyboardRange.get().notes, 49);

console.log('PASS: keyboard-range presets, persistence, MIDI hint, dimming, and calibrate');
console.log('\nAll keyboard-range tests PASSED.');
