const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../../shared/parse-abc');

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
