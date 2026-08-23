(function (root) {
  var STORAGE_KEY = 'keyboard-id';
  var STORAGE_CUSTOM = 'keyboard-custom';
  var EVENT = 'keyboard-range-change';
  var CUSTOM_ID = 'custom';
  var PIANO_LOW = 21;
  var PIANO_HIGH = 108;
  var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var PROMPT_LOW = 'Press the lowest key on your keyboard.';
  var PROMPT_HIGH = 'Now press the highest key.';

  var KEYBOARDS = [
    { id: '25-key', name: '25-key', span: 'C2–C4', low: 36, high: 60, notes: 25 },
    {
      id: '32-key',
      name: '32-key · Donner N-32',
      span: 'F2–C5',
      low: 41,
      high: 72,
      notes: 32,
      aliases: ['n32', 'n-32', 'donner'],
    },
    { id: '37-key', name: '37-key', span: 'C2–C5', low: 36, high: 72, notes: 37 },
    { id: '49-key', name: '49-key', span: 'C2–C6', low: 36, high: 84, notes: 49 },
    { id: '61-key', name: '61-key', span: 'C2–C7', low: 36, high: 96, notes: 61 },
    { id: '76-key', name: '76-key', span: 'E1–G7', low: 28, high: 103, notes: 76 },
    { id: '88-key', name: '88-key', span: 'A0–C8', low: 21, high: 108, notes: 88 },
  ];

  var DEFAULT_ID = '32-key';
  var cal = idleCal();
  var current = byId(DEFAULT_ID);

  function idleCal() {
    return { on: false, step: 'low', low: null, high: null };
  }

  function midiDisplay(midi) {
    var n = Number(midi);
    if (!isFinite(n)) return '';
    var oct = Math.floor(n / 12) - 1;
    return NOTE_NAMES[((n % 12) + 12) % 12] + oct;
  }

  function clampMidi(midi) {
    var n = Math.round(Number(midi));
    if (!isFinite(n)) return PIANO_LOW;
    if (n < PIANO_LOW) return PIANO_LOW;
    if (n > PIANO_HIGH) return PIANO_HIGH;
    return n;
  }

  function makeRange(id, low, high, name) {
    low = clampMidi(low);
    high = clampMidi(high);
    if (high < low) {
      var swap = low;
      low = high;
      high = swap;
    }
    return {
      id: id,
      name: name || 'Yours',
      span: midiDisplay(low) + '–' + midiDisplay(high),
      low: low,
      high: high,
      notes: high - low + 1,
    };
  }

  function byId(id) {
    if (id === CUSTOM_ID) return customFromStore();
    for (var i = 0; i < KEYBOARDS.length; i++) {
      if (KEYBOARDS[i].id === id) return KEYBOARDS[i];
    }
    return null;
  }

  function storageGet(key) {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    } catch (e) { /* ignore quota / private mode */ }
  }

  function savedId() {
    return storageGet(STORAGE_KEY);
  }

  function persist(id) {
    storageSet(STORAGE_KEY, id);
  }

  function persistCustom(kb) {
    storageSet(STORAGE_CUSTOM, JSON.stringify({ low: kb.low, high: kb.high }));
  }

  function customFromStore() {
    try {
      var raw = storageGet(STORAGE_CUSTOM);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !isFinite(o.low) || !isFinite(o.high)) return null;
      return makeRange(CUSTOM_ID, o.low, o.high, 'Yours');
    } catch (e) {
      return null;
    }
  }

  function hintText(kb) {
    kb = kb || current;
    return kb.span + ' · ' + kb.notes + ' keys';
  }

  function optionLabel(kb) {
    return kb.name;
  }

  function restore() {
    var id = savedId();
    var kb = byId(id) || byId(DEFAULT_ID);
    current = kb;
    return current;
  }

  function get() {
    return current;
  }

  function isDimmed(midi, range) {
    range = range || current;
    var n = Number(midi);
    return n < range.low || n > range.high;
  }

  function apply(rootEl) {
    var doc = rootEl || (typeof document !== 'undefined' ? document : null);
    if (!doc || !doc.querySelectorAll) return current;
    var keys = doc.querySelectorAll('.piano-key[data-midi]');
    for (var i = 0; i < keys.length; i++) {
      var midi = parseInt(keys[i].getAttribute('data-midi'), 10);
      if (isNaN(midi)) continue;
      keys[i].classList.toggle('dimmed', isDimmed(midi, current));
    }
    markCalibrateKeys(doc);
    return current;
  }

  function allKeyboards() {
    var list = KEYBOARDS.slice();
    var custom = customFromStore();
    if (custom) list.push(custom);
    return list;
  }

  function fillSelect(sel) {
    if (!sel) return;
    sel.innerHTML = '';
    var list = allKeyboards();
    for (var i = 0; i < list.length; i++) {
      var kb = list[i];
      var opt = document.createElement('option');
      opt.value = kb.id;
      opt.textContent = optionLabel(kb);
      sel.appendChild(opt);
    }
    sel.value = current.id;
  }

  function syncSelect() {
    if (typeof document === 'undefined') return;
    var sel = document.getElementById('keyboard-range');
    fillSelect(sel);
    var hint = document.getElementById('keyboard-range-hint');
    if (hint) hint.textContent = hintText(current);
    var spanEl = document.getElementById('keyboard-span');
    if (spanEl && current) spanEl.textContent = current.span;
  }

  function emit() {
    if (typeof document === 'undefined' || !document.dispatchEvent) return;
    try {
      document.dispatchEvent(new CustomEvent(EVENT, { detail: current }));
    } catch (e) { /* old browsers */ }
  }

  function commit(kb, opts) {
    var persistChoice = !opts || opts.persist !== false;
    current = kb;
    if (persistChoice) persist(kb.id);
    apply();
    syncSelect();
    emit();
    return current;
  }

  function setById(id, opts) {
    var kb = byId(id) || byId(DEFAULT_ID);
    return commit(kb, opts);
  }

  function setCustom(low, high, opts) {
    var kb = makeRange(CUSTOM_ID, low, high, 'Yours');
    if (!opts || opts.persist !== false) persistCustom(kb);
    return commit(kb, opts);
  }

  function matchMidiName(name) {
    var n = String(name || '').toLowerCase();
    if (!n) return null;
    for (var i = 0; i < KEYBOARDS.length; i++) {
      var aliases = KEYBOARDS[i].aliases || [];
      for (var j = 0; j < aliases.length; j++) {
        if (n.indexOf(aliases[j]) !== -1) return KEYBOARDS[i];
      }
    }
    return null;
  }

  /**
   * If the user has not picked a keyboard yet, use a known MIDI device name.
   * Saved choices always win.
   */
  function suggestFromMidiName(name) {
    if (savedId()) return current;
    var kb = matchMidiName(name);
    if (!kb) return current;
    return setById(kb.id, { persist: true });
  }

  function isCalibrating() {
    return !!cal.on;
  }

  function calibrateState() {
    return {
      on: cal.on,
      step: cal.step,
      low: cal.low,
      high: cal.high,
      prompt: cal.step === 'high' ? PROMPT_HIGH : PROMPT_LOW,
    };
  }

  function markCalibrateKeys(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc || !doc.querySelectorAll) return;
    var keys = doc.querySelectorAll('#piano-container .piano-key');
    for (var i = 0; i < keys.length; i++) {
      var midi = parseInt(keys[i].getAttribute('data-midi'), 10);
      var on = cal.on && (midi === cal.low || midi === cal.high);
      keys[i].classList.toggle('calibrate-end', on);
    }
  }

  function syncCalibrateUi() {
    if (typeof document === 'undefined') return;
    var row = document.getElementById('calibrate-row');
    var btn = document.getElementById('calibrate-btn');
    var prompt = document.getElementById('calibrate-prompt');
    var lowEl = document.getElementById('calibrate-low');
    var highEl = document.getElementById('calibrate-high');
    if (document.body) document.body.dataset.calibrating = cal.on ? 'true' : 'false';
    if (row) {
      if (cal.on) row.removeAttribute('hidden');
      else row.setAttribute('hidden', '');
    }
    if (btn) {
      btn.setAttribute('aria-expanded', cal.on ? 'true' : 'false');
    }
    if (prompt) prompt.textContent = cal.step === 'high' ? PROMPT_HIGH : PROMPT_LOW;
    if (lowEl) {
      lowEl.textContent = cal.low != null
        ? midiDisplay(cal.low)
        : (current ? midiDisplay(current.low) : '—');
    }
    if (highEl) {
      highEl.textContent = cal.high != null
        ? midiDisplay(cal.high)
        : (current ? midiDisplay(current.high) : '—');
    }
    markCalibrateKeys();
  }

  function startCalibrate() {
    cal = { on: true, step: 'low', low: null, high: null };
    syncCalibrateUi();
    return calibrateState();
  }

  function cancelCalibrate() {
    cal = idleCal();
    syncCalibrateUi();
    return calibrateState();
  }

  function toggleCalibrate() {
    if (cal.on) return cancelCalibrate();
    return startCalibrate();
  }

  function hear(midi) {
    if (!cal.on) return { done: false };
    midi = clampMidi(midi);
    if (cal.step === 'low') {
      cal.low = midi;
      cal.step = 'high';
      syncCalibrateUi();
      return { done: false, step: 'high', low: midi };
    }
    if (midi === cal.low) return { done: false, step: 'high', low: cal.low };
    cal.high = midi;
    var low = Math.min(cal.low, cal.high);
    var high = Math.max(cal.low, cal.high);
    cal = idleCal();
    setCustom(low, high);
    syncCalibrateUi();
    return { done: true, low: low, high: high };
  }

  function bindUi() {
    if (typeof document === 'undefined') return;
    var btn = document.getElementById('calibrate-btn');
    var cancel = document.getElementById('calibrate-cancel');
    var piano = document.getElementById('piano-container');
    if (btn && !btn._keyboardRangeBound) {
      btn._keyboardRangeBound = true;
      btn.addEventListener('click', function () { toggleCalibrate(); });
    }
    if (cancel && !cancel._keyboardRangeBound) {
      cancel._keyboardRangeBound = true;
      cancel.addEventListener('click', function () { cancelCalibrate(); });
    }
    if (piano && !piano._keyboardRangeBound) {
      piano._keyboardRangeBound = true;
      piano.addEventListener('pointerdown', function (ev) {
        if (!cal.on) return;
        var key = ev.target.closest && ev.target.closest('.piano-key[data-midi]');
        if (!key) return;
        hear(parseInt(key.getAttribute('data-midi'), 10));
      });
    }
  }

  function mount() {
    restore();
    if (typeof document === 'undefined') return current;
    bindUi();
    syncSelect();
    syncCalibrateUi();
    apply();
    var sel = document.getElementById('keyboard-range');
    if (sel && !sel._keyboardRangeBound) {
      sel._keyboardRangeBound = true;
      sel.addEventListener('change', function () {
        setById(sel.value, { persist: true });
      });
    }
    return current;
  }

  current = restore();

  var api = {
    KEYBOARDS: KEYBOARDS,
    DEFAULT_ID: DEFAULT_ID,
    CUSTOM_ID: CUSTOM_ID,
    STORAGE_KEY: STORAGE_KEY,
    STORAGE_CUSTOM: STORAGE_CUSTOM,
    EVENT: EVENT,
    PROMPT_LOW: PROMPT_LOW,
    PROMPT_HIGH: PROMPT_HIGH,
    byId: byId,
    get: get,
    setById: setById,
    setCustom: setCustom,
    restore: restore,
    apply: apply,
    isDimmed: isDimmed,
    matchMidiName: matchMidiName,
    suggestFromMidiName: suggestFromMidiName,
    hintText: hintText,
    optionLabel: optionLabel,
    midiDisplay: midiDisplay,
    mount: mount,
    savedId: savedId,
    isCalibrating: isCalibrating,
    calibrateState: calibrateState,
    startCalibrate: startCalibrate,
    cancelCalibrate: cancelCalibrate,
    toggleCalibrate: toggleCalibrate,
    hear: hear,
  };

  root.KeyboardRange = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
