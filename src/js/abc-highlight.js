(function (root) {
  var TOKEN_RE = /\((\d+)(?::(\d+))?(?::(\d+))?|(\.)?\[(.*?)\](\d*)(\/*)(\d*)(-)?|(\.)?(\^{1,2}|_{1,2}|=)?([A-Ga-gzZxX])([',]*)(\d*)(\/*)(\d*)(-)?/g;
  var INNER_NOTE_RE = /(\^{1,2}|_{1,2}|=)?([A-Ga-gzZxX])([',]*)(\d*)(\/*)(\d*)(-)?/g;
  var HIGHLIGHT_RE = /(%[^\n]*)|([A-Z]:)|(\|:|:\||\|\]|\[\||\|\||\|)|(&)|(\^{1,2}|_{1,2}|=)|([A-Ga-g][',]*)|([zZxX])|(\(\d+(?::\d+)?(?::\d+)?)|(\d+|\/+)|(\[|\])|(\s+)|./g;

  function collectAbcNoteSpans(text) {
    var spans = [];
    if (!text) return spans;
    var lines = text.split('\n');
    var offset = 0;
    for (var li = 0; li < lines.length; li++) {
      var raw = lines[li];
      var line = raw.replace(/\r$/, '');
      var trimmed = line.trim();
      if (!/^[A-Z]:/.test(trimmed)) {
        TOKEN_RE.lastIndex = 0;
        var m;
        while ((m = TOKEN_RE.exec(line)) !== null) {
          if (m[1] !== undefined && m[5] === undefined && m[12] === undefined) continue;
          if (m[5] !== undefined) {
            var open = m[0].indexOf('[');
            var innerStart = offset + m.index + (open >= 0 ? open + 1 : 0);
            INNER_NOTE_RE.lastIndex = 0;
            var nm;
            while ((nm = INNER_NOTE_RE.exec(m[5])) !== null) {
              if (/^[zZxX]$/.test(nm[2])) continue;
              spans.push({
                start: innerStart + nm.index,
                end: innerStart + nm.index + nm[0].length,
                letter: nm[2].toUpperCase(),
              });
            }
          } else if (m[12] && !/^[zZxX]$/.test(m[12])) {
            spans.push({
              start: offset + m.index,
              end: offset + m.index + m[0].length,
              letter: m[12].toUpperCase(),
            });
          }
        }
      }
      offset += raw.length + 1;
    }
    return spans;
  }

  function attachAbcSourceSpans(text, notes) {
    if (!notes || !notes.length) return notes;
    var spans = collectAbcNoteSpans(text);
    var si = 0;
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      while (si < spans.length && spans[si].letter !== n.note) si++;
      if (si >= spans.length) break;
      n.srcStart = spans[si].start;
      n.srcEnd = spans[si].end;
      si++;
    }
    return notes;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function kindClass(kind) {
    return 'abc-tok abc-' + kind;
  }

  function highlightAbc(source) {
    var text = source || '';
    var noteSpans = collectAbcNoteSpans(text);
    var ni = 0;
    var html = '';
    var i = 0;
    var atLineStart = true;
    while (i < text.length) {
      if (noteSpans[ni] && i === noteSpans[ni].start) {
        var span = noteSpans[ni];
        html += '<span class="' + kindClass('note') + '" data-src-start="' + span.start + '" data-src-end="' + span.end + '">'
          + escapeHtml(text.slice(span.start, span.end)) + '</span>';
        i = span.end;
        ni++;
        atLineStart = false;
        continue;
      }
      var ch = text[i];
      if (ch === '\n') {
        html += '\n';
        i++;
        atLineStart = true;
        continue;
      }
      if (ch === '%' ) {
        var eol = text.indexOf('\n', i);
        if (eol < 0) eol = text.length;
        html += '<span class="' + kindClass('comment') + '">' + escapeHtml(text.slice(i, eol)) + '</span>';
        i = eol;
        atLineStart = false;
        continue;
      }
      if (atLineStart && /[A-Z]/.test(ch) && text[i + 1] === ':') {
        html += '<span class="' + kindClass('header-key') + '">' + escapeHtml(text.slice(i, i + 2)) + '</span>';
        i += 2;
        var hend = text.indexOf('\n', i);
        if (hend < 0) hend = text.length;
        if (hend > i) {
          html += '<span class="' + kindClass('header-val') + '">' + escapeHtml(text.slice(i, hend)) + '</span>';
          i = hend;
        }
        atLineStart = false;
        continue;
      }
      HIGHLIGHT_RE.lastIndex = i;
      var hm = HIGHLIGHT_RE.exec(text);
      if (!hm || hm.index !== i) {
        html += escapeHtml(ch);
        i++;
        atLineStart = false;
        continue;
      }
      var tok = hm[0];
      var cls = 'plain';
      if (hm[3]) cls = 'bar';
      else if (hm[4]) cls = 'voice';
      else if (hm[5]) cls = 'accidental';
      else if (hm[7]) cls = 'rest';
      else if (hm[8]) cls = 'tuplet';
      else if (hm[9]) cls = 'duration';
      else if (hm[10]) cls = 'chord';
      else if (hm[11]) cls = 'space';
      if (cls === 'space' || cls === 'plain') html += escapeHtml(tok);
      else html += '<span class="' + kindClass(cls) + '">' + escapeHtml(tok) + '</span>';
      i += tok.length;
      atLineStart = false;
    }
    return html;
  }

  root.collectAbcNoteSpans = collectAbcNoteSpans;
  root.attachAbcSourceSpans = attachAbcSourceSpans;
  root.highlightAbc = highlightAbc;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      collectAbcNoteSpans: collectAbcNoteSpans,
      attachAbcSourceSpans: attachAbcSourceSpans,
      highlightAbc: highlightAbc,
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
