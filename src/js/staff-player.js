(function (root) {
  var STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var PC_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
  var N32_LOW = 41;
  var N32_HIGH = 72;
  var PIANO_LOW = 21;
  var PIANO_HIGH = 108;
  var CENTER_MIDI = 60;
  var WHITE_KEY_PX = 22;

  function parsePlayerNotes(str) {
    if (!str) return [];
    var parts = String(str).split(/[\s,]+/).filter(Boolean);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var m = parts[i].match(/^([A-Ga-g])([#b]?)(\d)$/);
      if (!m) continue;
      var letter = m[1].toUpperCase();
      var acc = m[2] === '#' ? 1 : (m[2] === 'b' ? -1 : 0);
      var oct = parseInt(m[3], 10);
      if (STEPS[letter] === undefined) continue;
      var midi = (oct + 1) * 12 + STEPS[letter] + acc;
      var accMark = m[2] === '#' ? 's' : (m[2] === 'b' ? 'f' : '');
      out.push({
        name: letter.toLowerCase() + accMark + oct,
        letter: letter,
        oct: oct,
        midi: midi,
      });
    }
    return out;
  }

  function isWhiteMidi(midi) {
    var pc = ((midi % 12) + 12) % 12;
    return pc !== 1 && pc !== 3 && pc !== 6 && pc !== 8 && pc !== 10;
  }

  function whiteMidis() {
    var list = [];
    for (var m = PIANO_LOW; m <= PIANO_HIGH; m++) {
      if (isWhiteMidi(m)) list.push(m);
    }
    return list;
  }

  function whiteCountForWidth(widthPx, scale) {
    var s = scale || 1;
    var w = WHITE_KEY_PX * s;
    if (!widthPx || widthPx < w) return 19;
    return Math.max(8, Math.floor(widthPx / w));
  }

  function midisCenteredOnC4(whiteCount) {
    var whites = whiteMidis();
    var ci = whites.indexOf(CENTER_MIDI);
    var n = Math.max(1, whiteCount || 19);
    var half = Math.floor((n - 1) / 2);
    var start = Math.max(0, ci - half);
    var end = Math.min(whites.length, start + n);
    start = Math.max(0, end - n);
    var first = whites[start];
    var last = whites[end - 1];
    var out = [];
    for (var m = first; m <= last; m++) out.push(m);
    return out;
  }

  function midiToNoteName(midi) {
    var oct = Math.floor(midi / 12) - 1;
    return PC_NAMES[((midi % 12) + 12) % 12] + oct;
  }

  function midiDisplay(midi) {
    var names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    var oct = Math.floor(midi / 12) - 1;
    return names[((midi % 12) + 12) % 12] + oct;
  }

  function octaveBand(noteName, oct) {
    var letter = String(noteName).charAt(0).toUpperCase();
    if (letter === 'A' || letter === 'B') return oct;
    return oct - 1;
  }

  function staffLabel(n) {
    var acc = '';
    if (n.name.charAt(1) === 's') acc = '♯';
    else if (n.name.charAt(1) === 'f') acc = '♭';
    return n.letter + acc + n.oct;
  }

  root.parsePlayerNotes = parsePlayerNotes;
  root.whiteCountForWidth = whiteCountForWidth;
  root.midisCenteredOnC4 = midisCenteredOnC4;

  if (typeof customElements === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = {
        parsePlayerNotes: parsePlayerNotes,
        whiteCountForWidth: whiteCountForWidth,
        midisCenteredOnC4: midisCenteredOnC4,
        N32_LOW: N32_LOW,
        N32_HIGH: N32_HIGH,
        CENTER_MIDI: CENTER_MIDI,
        WHITE_KEY_PX: WHITE_KEY_PX,
      };
    }
    return;
  }

  var playerSeq = 0;

  class StaffPlayer extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this._id = 'sp' + (++playerSeq);
      this._held = new Set();
      this._pos = 0;
      this._done = false;
      this._shouldTimer = 0;
      this.innerHTML =
        '<div class="staff-player">' +
          '<note-chart data-extent="base"></note-chart>' +
          '<div class="staff-player-keys" role="group" aria-label="Small piano"></div>' +
        '</div>';
      if (!StaffPlayer.active) StaffPlayer.active = this;
      var self = this;
      this.addEventListener('pointerdown', function () { self._arm(); });
      this._paint();
      this._watchWidth();
      this._listenMidi();
    }

    static get observedAttributes() {
      return ['notes', 'chord', 'advance'];
    }

    attributeChangedCallback() {
      if (this._built) {
        this._pos = 0;
        this._done = false;
        this._paint();
      }
    }

    _arm() {
      StaffPlayer.active = this;
    }

    _targets() {
      var notes = this._notes || [];
      if (notes.length === 0) return [];
      if (this.hasAttribute('chord')) return notes;
      if (this._pos >= notes.length) return [];
      return [notes[this._pos]];
    }

    _paint() {
      var chart = this.querySelector('note-chart');
      if (!chart) return;
      if (!chart._ctx) {
        var self = this;
        this._tries = (this._tries || 0) + 1;
        if (this._tries < 40) setTimeout(function () { self._paint(); }, 25);
        return;
      }
      this._tries = 0;
      var notes = parsePlayerNotes(this.getAttribute('notes'));
      this._notes = notes;
      this._paintNotes();
      this._buildKeys();
    }

    _paintNotes() {
      var chart = this.querySelector('note-chart');
      if (!chart || !chart._ctx) return;
      if (chart.clearNoteHeads) chart.clearNoteHeads();
      var notes = this._notes || [];
      var ctx = chart._ctx;
      var headX = chart._headX !== undefined
        ? chart._headX
        : ctx.LEFT_PAD + (ctx.STAFF_R - ctx.LEFT_PAD) * 0.03;
      var spacing = ctx.SPACING * 3.2;
      var chord = this.hasAttribute('chord');
      if (chord) {
        for (var i = 0; i < notes.length; i++) {
          chart.renderNoteHead(notes[i].name, 'pending', headX, false, 1);
        }
      } else {
        for (var j = this._pos; j < notes.length; j++) {
          var x = headX + (j - this._pos) * spacing;
          chart.renderNoteHead(notes[j].name, 'pending', x, false, 1);
        }
      }
      this._syncGhosts();
    }

    _syncGhosts() {
      var chart = this.querySelector('note-chart');
      if (!chart || !chart.renderNoteHead) return;
      var layer = chart.querySelector('#head-ghosts');
      if (layer) layer.innerHTML = '';
      if (this._held.size === 0) return;
      var ctx = chart._ctx;
      var headX = chart._headX !== undefined
        ? chart._headX
        : (ctx ? ctx.LEFT_PAD + (ctx.STAFF_R - ctx.LEFT_PAD) * 0.03 : 0);
      this._held.forEach(function (midi) {
        chart.renderNoteHead(midiToNoteName(midi), 'ghost', headX, false);
      });
    }

    _showShould(targets) {
      var chart = this.querySelector('note-chart');
      if (!chart) return;
      if (chart.clearShouldLabels) chart.clearShouldLabels();
      var list = targets || this._targets();
      for (var i = 0; i < list.length; i++) {
        if (chart.showShouldLabel) {
          chart.showShouldLabel(list[i].letter, list[i].oct, staffLabel(list[i]));
        }
      }
      this._markShouldKeys(list.map(function (n) { return n.midi; }));
    }

    _clearShouldKeys() {
      this.querySelectorAll('.piano-key.should').forEach(function (el) {
        el.classList.remove('should');
      });
    }

    _markShouldKeys(midis) {
      var self = this;
      this._clearShouldKeys();
      (midis || []).forEach(function (midi) {
        var el = self.querySelector('.piano-key[data-midi="' + midi + '"]');
        if (el) el.classList.add('should');
      });
      if (this._shouldTimer) clearTimeout(this._shouldTimer);
      this._shouldTimer = setTimeout(function () {
        self._clearShouldKeys();
      }, 900);
    }

    _onPitch(midi, opts) {
      this._arm();
      if (StaffPlayer.active !== this) return;
      if (this._done) return;
      var name = midiToNoteName(midi);
      if (opts && opts.play && typeof playMidiNote === 'function') playMidiNote(midi, 100);
      if (opts && opts.play && typeof keyOn === 'function') keyOn(name);
      var chartEl = this.querySelector('note-chart');
      if (opts && opts.play && chartEl && chartEl.highlightStaffNote) chartEl.highlightStaffNote(name, true);
      this._held.add(midi);
      this._syncGhosts();
      var targets = this._targets();
      if (targets.length === 0) return;
      var wanted = {};
      for (var i = 0; i < targets.length; i++) wanted[targets[i].midi] = true;
      if (!wanted[midi]) {
        this._showShould(targets);
        return;
      }
      if (this.hasAttribute('chord')) {
        var all = true;
        for (var j = 0; j < targets.length; j++) {
          if (!this._held.has(targets[j].midi)) all = false;
        }
        if (all) this._complete();
      } else {
        this._pos += 1;
        this._paintNotes();
        if (this._pos >= (this._notes || []).length) this._complete();
      }
    }

    _onPitchOff(midi, opts) {
      this._held.delete(midi);
      this._syncGhosts();
      var name = midiToNoteName(midi);
      if (opts && opts.play && typeof keyOff === 'function') keyOff(name);
      var chartEl = this.querySelector('note-chart');
      if (opts && opts.play && chartEl && chartEl.highlightStaffNote) chartEl.highlightStaffNote(name, false);
    }

    _complete() {
      if (this._done) return;
      this._done = true;
      this._clearShouldKeys();
      var chart = this.querySelector('note-chart');
      if (chart && chart.clearShouldLabels) chart.clearShouldLabels();
      var sel = this.getAttribute('advance');
      if (sel) {
        var el = document.querySelector(sel);
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      this.dispatchEvent(new CustomEvent('staff-player-done', { bubbles: true }));
    }

    _watchWidth() {
      var host = this.querySelector('.staff-player-keys');
      if (!host || typeof ResizeObserver === 'undefined') return;
      var self = this;
      this._ro = new ResizeObserver(function () {
        self._buildKeys(true);
      });
      this._ro.observe(host);
    }

    _uiScale() {
      if (typeof getComputedStyle === 'undefined') return 1;
      return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-scale')) || 1;
    }

    _buildKeys(force) {
      var host = this.querySelector('.staff-player-keys');
      if (!host) return;
      var width = host.clientWidth;
      if (!width) {
        var self = this;
        if ((this._keyTries || 0) < 20) {
          this._keyTries = (this._keyTries || 0) + 1;
          setTimeout(function () { self._buildKeys(force); }, 40);
        }
        return;
      }
      this._keyTries = 0;
      var nWhite = whiteCountForWidth(width, this._uiScale());
      var midis = midisCenteredOnC4(nWhite);
      var sig = midis[0] + ':' + midis[midis.length - 1] + ':' + midis.length;
      if (!force && host.getAttribute('data-range') === sig && host.childElementCount > 0) return;
      host.setAttribute('data-range', sig);
      host.innerHTML = '';
      var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      for (var i = 0; i < midis.length; i++) {
        var midi = midis[i];
        var oct = Math.floor(midi / 12) - 1;
        var noteName = NOTES[midi % 12];
        var isBlack = noteName.indexOf('#') !== -1;
        var fullName = midiToNoteName(midi);
        var key = document.createElement('div');
        key.className = 'piano-key ' + (isBlack ? 'black' : 'white');
        key.dataset.note = fullName;
        key.dataset.midi = String(midi);
        key.dataset.band = String(octaveBand(noteName, oct));
        if (midi < N32_LOW || midi > N32_HIGH) key.classList.add('dimmed');
        key.setAttribute('role', 'button');
        key.setAttribute('aria-label', midiDisplay(midi));
        this._bindKey(key, midi);
        host.appendChild(key);
      }
    }

    _bindKey(el, midi) {
      var self = this;
      var down = false;
      function start(ev) {
        if (ev) ev.preventDefault();
        down = true;
        self._onPitch(midi, { play: true });
      }
      function stop() {
        if (!down) return;
        down = false;
        self._onPitchOff(midi, { play: true });
      }
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointerleave', stop);
      el.addEventListener('pointercancel', stop);
    }

    _listenMidi() {
      if (!window.__midiObservers) window.__midiObservers = [];
      var self = this;
      window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
        if (isNoteOn) self._onPitch(midiNote, { play: false });
        else if (isNoteOff) self._onPitchOff(midiNote, { play: false });
      });
    }
  }

  StaffPlayer.active = null;
  customElements.define('staff-player', StaffPlayer);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parsePlayerNotes: parsePlayerNotes,
      whiteCountForWidth: whiteCountForWidth,
      midisCenteredOnC4: midisCenteredOnC4,
      N32_LOW: N32_LOW,
      N32_HIGH: N32_HIGH,
      CENTER_MIDI: CENTER_MIDI,
      WHITE_KEY_PX: WHITE_KEY_PX,
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
