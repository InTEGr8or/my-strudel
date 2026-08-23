(function (root) {
  var NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

  function noteName(midi) {
    var oct = Math.floor(midi / 12) - 1;
    return NAMES[((midi % 12) + 12) % 12] + oct;
  }

  function bindKey(el) {
    if (el._pianoDiagramBound) return;
    var midi = parseInt(el.getAttribute('data-midi'), 10);
    if (isNaN(midi)) return;
    el._pianoDiagramBound = true;
    var down = false;

    function start(ev) {
      if (ev) ev.preventDefault();
      down = true;
      el.classList.add('active');
      var name = el.getAttribute('data-note') || noteName(midi);
      if (typeof keyOn === 'function') keyOn(name);
      if (typeof playMidiNote === 'function') playMidiNote(midi, 100);
    }

    function stop() {
      if (!down) return;
      down = false;
      el.classList.remove('active');
      var name = el.getAttribute('data-note') || noteName(midi);
      if (typeof keyOff === 'function') keyOff(name);
    }

    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointerleave', stop);
    el.addEventListener('pointercancel', stop);
  }

  function mount(rootEl) {
    var scope = rootEl || (typeof document !== 'undefined' ? document : null);
    if (!scope || !scope.querySelectorAll) return;
    var keys = scope.querySelectorAll('.piano-diagram [data-midi]');
    for (var i = 0; i < keys.length; i++) bindKey(keys[i]);
  }

  var api = { mount: mount, noteName: noteName };
  root.PianoDiagram = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
    else mount();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
