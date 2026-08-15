const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../shared/parse-abc');

function getFilesRecursively(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFilesRecursively(res, exts, acc);
    } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
      acc.push(res);
    }
  }
  return acc;
}

module.exports = function () {
  const songsDir = path.join(__dirname, '..', 'songs', 'sight-reading', 'songs');
  let songs = [];
  if (fs.existsSync(songsDir)) {
    const abcFiles = getFilesRecursively(songsDir, ['.abc']).sort();
    for (const filePath of abcFiles) {
      const text = fs.readFileSync(filePath, 'utf-8');
      const result = parseAbc(text);
      const relPath = path.relative(songsDir, filePath);
      const id = relPath.replace(/\.abc$/, '').replace(/\\/g, '/');
      songs.push({
        id,
        title: result.title || path.basename(filePath, '.abc'),
        tempo: result.tempo || 80,
        notes: result.notes,
        rests: result.rests,
        timeSignature: result.timeSignature,
        keySignature: result.keySignature,
      });
    }
  }
  const uniqueSongs = [];
  const seenTitles = new Set();
  for (const song of songs) {
    if (!seenTitles.has(song.title)) {
      seenTitles.add(song.title);
      uniqueSongs.push(song);
    }
  }
  return uniqueSongs;
};
