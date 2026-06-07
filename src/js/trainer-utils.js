(function () {
  if (window.TRAINER_UTILS) return;
  var SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  var SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var MIDI_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

  function midiToNatural(midi) {
    var oct = Math.floor(midi / 12) - 1;
    return MIDI_NAMES[midi % 12] + oct;
  }

  function naturalToMidi(note, oct) {
    return (oct + 1) * 12 + SCALE_MIDI[note];
  }

  function noteName(pos) {
    return pos.note.toLowerCase() + pos.oct;
  }

  function posToMidi(pos) {
    return naturalToMidi(pos.note, pos.oct);
  }

  window.TRAINER_UTILS = {
    SCALE: SCALE,
    SCALE_MIDI: SCALE_MIDI,
    MIDI_NAMES: MIDI_NAMES,
    midiToNatural: midiToNatural,
    naturalToMidi: naturalToMidi,
    noteName: noteName,
    posToMidi: posToMidi,
  };
})();
