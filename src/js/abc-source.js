(function () {
  var STORAGE_SHOW = 'show-abc';
  var STORAGE_EXPAND = 'abc-expanded';
  var STORAGE_SYNC = 'abc-sync';
  var POLL_MS = 320;
  var paintedBeat = null;
  var tokenIndex = null;
  var sourceText = '';
  var pollId = 0;
  var idleId = 0;
  var syncOn = false;

  function panel() { return document.getElementById('abc-source-panel'); }
  function codeEl() { return document.getElementById('abc-source-code'); }
  function scroller() { return document.getElementById('abc-source-scroll'); }
  function showBtns() { return document.querySelectorAll('[data-abc-toggle]'); }
  function expandBtn() { return document.getElementById('abc-expand-toggle'); }
  function syncBtn() { return document.getElementById('abc-sync-toggle'); }

  function isShown() {
    var el = panel();
    return !!(el && el.dataset.show === 'true');
  }

  function stopClock() {
    if (pollId) {
      clearInterval(pollId);
      pollId = 0;
    }
    if (idleId && window.cancelIdleCallback) {
      cancelIdleCallback(idleId);
      idleId = 0;
    }
  }

  function startClock() {
    if (pollId || !syncOn || !isShown()) return;
    pollId = setInterval(schedulePaint, POLL_MS);
  }

  function applyShow(on) {
    var el = panel();
    if (!el) return;
    el.dataset.show = on ? 'true' : 'false';
    var btns = showBtns();
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-checked', on ? 'true' : 'false');
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    try { localStorage.setItem(STORAGE_SHOW, on ? 'true' : 'false'); } catch (_) {}
    if (on && syncOn) {
      if (!tokenIndex) buildTokenIndex();
      startClock();
    } else {
      stopClock();
    }
  }

  function applyExpand(on) {
    var el = panel();
    if (!el) return;
    el.dataset.expanded = on ? 'true' : 'false';
    var btn = expandBtn();
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'Collapse' : 'Expand';
    }
    try { localStorage.setItem(STORAGE_EXPAND, on ? 'true' : 'false'); } catch (_) {}
  }

  function applySync(on) {
    syncOn = !!on;
    var btn = syncBtn();
    if (btn) {
      btn.setAttribute('aria-checked', syncOn ? 'true' : 'false');
      btn.setAttribute('aria-pressed', syncOn ? 'true' : 'false');
    }
    try { localStorage.setItem(STORAGE_SYNC, syncOn ? 'true' : 'false'); } catch (_) {}
    if (syncOn && isShown()) startClock();
    else stopClock();
  }

  function setAbcSource(text) {
    sourceText = text || '';
    tokenIndex = null;
    paintedBeat = null;
    var code = codeEl();
    var el = panel();
    if (!code || !el) return;
    if (!sourceText) {
      el.dataset.empty = 'true';
      code.innerHTML = '<span class="abc-empty">No ABC source for this drill.</span>';
      return;
    }
    el.dataset.empty = 'false';
    var html = window.highlightAbc ? window.highlightAbc(sourceText) : escapeText(sourceText);
    code.innerHTML = html;
    if (isShown() && syncOn) buildTokenIndex();
  }

  function escapeText(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildTokenIndex() {
    var code = codeEl();
    tokenIndex = Object.create(null);
    if (!code) return;
    var toks = code.querySelectorAll('[data-src-start]');
    for (var i = 0; i < toks.length; i++) {
      tokenIndex[toks[i].getAttribute('data-src-start')] = toks[i];
    }
  }

  function schedulePaint() {
    if (!syncOn || !isShown()) return;
    var beat = window.__abcCursorBeat;
    if (beat === paintedBeat) return;
    if (idleId) return;
    if (window.requestIdleCallback) {
      idleId = requestIdleCallback(function () {
        idleId = 0;
        paint(window.__abcCursorBeat);
      }, { timeout: 800 });
    } else {
      idleId = setTimeout(function () {
        idleId = 0;
        paint(window.__abcCursorBeat);
      }, 0);
    }
  }

  function paint(beat) {
    if (!syncOn || !isShown()) return;
    if (beat === paintedBeat) return;
    var code = codeEl();
    var box = scroller();
    if (!code) return;
    if (!tokenIndex) buildTokenIndex();

    var prev = code.querySelectorAll('.abc-current');
    for (var i = 0; i < prev.length; i++) prev[i].classList.remove('abc-current');
    paintedBeat = beat;
    if (beat == null) return;

    var notes = window.__abcCursorNotes || [];
    var first = null;
    for (var n = 0; n < notes.length; n++) {
      var note = notes[n];
      if (note.srcStart == null) continue;
      if (Math.abs(note.startBeat - beat) > 0.08) continue;
      var tok = tokenIndex[String(note.srcStart)];
      if (!tok) continue;
      tok.classList.add('abc-current');
      if (!first) first = tok;
    }
    if (first && box) {
      var boxRect = box.getBoundingClientRect();
      var tokRect = first.getBoundingClientRect();
      if (tokRect.top < boxRect.top || tokRect.top > boxRect.top + 48) {
        var top = tokRect.top - boxRect.top + box.scrollTop - 8;
        box.scrollTop = top < 0 ? 0 : top;
      }
    }
  }

  function init() {
    var el = panel();
    if (!el) return;
    var showSaved = false;
    var expandSaved = false;
    var syncSaved = false;
    try {
      showSaved = localStorage.getItem(STORAGE_SHOW) === 'true';
      expandSaved = localStorage.getItem(STORAGE_EXPAND) === 'true';
      syncSaved = localStorage.getItem(STORAGE_SYNC) === 'true';
    } catch (_) {}
    applyShow(showSaved);
    applyExpand(expandSaved);
    applySync(syncSaved);

    var raw = document.getElementById('abc-source-data');
    var initial = '';
    if (raw) {
      try { initial = JSON.parse(raw.textContent || '""'); } catch (_) { initial = ''; }
    }
    if (initial) setAbcSource(initial);

    var eBtn = expandBtn();
    if (eBtn) {
      eBtn.addEventListener('click', function () {
        applyExpand(el.dataset.expanded !== 'true');
      });
    }
    var sBtn = syncBtn();
    if (sBtn) {
      sBtn.addEventListener('click', function () {
        applySync(!syncOn);
      });
    }
  }

  window.setAbcSource = setAbcSource;
  window.toggleAbcSource = function () { applyShow(!isShown()); };
  window.toggleAbcSync = function () { applySync(!syncOn); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
