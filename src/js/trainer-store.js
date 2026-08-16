(function (root) {
  function createTrainerStore(initial) {
    var state = Object.assign({
      songId: null,
      songTitle: '',
      notes: null,
      rests: [],
      tempo: 80,
      bpm: 80,
      playing: false,
      range: 'full',
      timeSignature: null,
      keySignature: [],
      patternSize: 1,
      wait: false,
    }, initial || {});
    var listeners = [];

    function get() {
      return state;
    }

    function set(patch) {
      if (!patch || typeof patch !== 'object') return state;
      var prev = state;
      var next = Object.assign({}, state, patch);
      var changed = false;
      Object.keys(next).forEach(function (key) {
        if (next[key] !== prev[key]) changed = true;
      });
      if (!changed) return state;
      state = next;
      listeners.slice().forEach(function (fn) { fn(state, prev); });
      return state;
    }

    function subscribe(fn) {
      if (typeof fn !== 'function') return function () {};
      listeners.push(fn);
      return function unsubscribe() {
        listeners = listeners.filter(function (l) { return l !== fn; });
      };
    }

    return { get: get, set: set, subscribe: subscribe };
  }

  root.createTrainerStore = createTrainerStore;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createTrainerStore };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
