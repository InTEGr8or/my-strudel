const fs = require('fs');
const path = require('path');

function parseAbc(text) {
  const lines = text.split('\n');
  let title = '';
  const bodyLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('T:')) title = trimmed.slice(2).trim();
    else if (!/^[A-Z]:/.test(trimmed)) bodyLines.push(trimmed);
  }
  const body = bodyLines.join(' ').replace(/[|:[\]]/g, ' ');
  const notes = [];
  const re = /([\^_=])?([A-Ga-g])([',]*)(?:\/?\d*)?/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const letter = m[2];
    const markers = m[3];
    let oct = letter === letter.toUpperCase() ? 4 : 5;
    for (const ch of markers) {
      if (ch === "'") oct++;
      else if (ch === ',') oct--;
    }
    if (oct >= 1 && oct <= 8) {
      notes.push({ note: letter.toUpperCase(), oct });
    }
  }
  return { title: title || 'Unknown', notes };
}

module.exports = class {
  data() {
    return {
      permalink: '/songs/sight-reading/songs.json',
      layout: false,
      eleventyExcludeFromCollections: true,
    };
  }
  render(data) {
    const songsDir = path.join(__dirname, 'songs');
    let songs = [];
    if (fs.existsSync(songsDir)) {
      const files = fs.readdirSync(songsDir).filter(f => f.endsWith('.abc')).sort();
      for (const file of files) {
        const text = fs.readFileSync(path.join(songsDir, file), 'utf-8');
        const { title, notes } = parseAbc(text);
        songs.push({ id: file.replace('.abc', ''), title, notes });
      }
    }
    return JSON.stringify(songs, null, 2);
  }
};
