const { getMetadata } = require('./metadata-parser.js');
const path = require('path');
const fs = require('fs');
const { parseAbc, splitAbcTunes } = require('./src/shared/parse-abc');
const { sortLessons } = require('./src/shared/lesson-order');
const { convertMuseScoreIncremental } = require('./scripts/build-musescore');

module.exports = function (eleventyConfig) {
  eleventyConfig.on('eleventy.before', async () => {
    const srcDir = path.join(__dirname, 'data', 'musescore');
    const destDir = path.join(__dirname, 'src', 'songs', 'sight-reading', 'songs', 'musescore');
    convertMuseScoreIncremental(srcDir, destDir);
  });

  eleventyConfig.addTemplateFormats('strudel,tidal,abc');

  eleventyConfig.addExtension('strudel', strudelExtension);
  eleventyConfig.addExtension('tidal', strudelExtension);
  eleventyConfig.addExtension('abc', abcExtension);

  eleventyConfig.addPassthroughCopy({ 'src/js': 'js' });
  eleventyConfig.addPassthroughCopy({ 'src/css': 'css' });
  eleventyConfig.addPassthroughCopy({ 'src/soundfonts': 'soundfonts' });
  eleventyConfig.addPassthroughCopy({ 'src/favicon.svg': 'favicon.svg' });
  eleventyConfig.addPassthroughCopy({ 'src/favicon.png': 'favicon.png' });
  eleventyConfig.addPassthroughCopy({ 'src/piano-d-key.svg': 'piano-d-key.svg' });
  eleventyConfig.addPassthroughCopy({ 'src/piano-a-to-g.svg': 'piano-a-to-g.svg' });

  eleventyConfig.addShortcode('pianoDiagram', function (file) {
    return fs.readFileSync(path.join(__dirname, 'src', file), 'utf8');
  });

  eleventyConfig.addWatchTarget('./data/musescore/');
  eleventyConfig.addWatchTarget('./src/lessons/');
  eleventyConfig.addWatchTarget('./src/songs/sketches/');
  eleventyConfig.addWatchTarget('./src/piano-d-key.svg');
  eleventyConfig.addWatchTarget('./src/piano-a-to-g.svg');

  eleventyConfig.addShortcode('lessonNotes', function (lessonId) {
    const abcPath = path.join(__dirname, 'src', 'lessons', lessonId, 'exercises.abc');
    if (!fs.existsSync(abcPath)) return '[]';
    const text = fs.readFileSync(abcPath, 'utf-8');
    const result = parseAbc(text);
    return JSON.stringify(result.notes);
  });

  eleventyConfig.addShortcode('lessonTunes', function (lessonId) {
    const abcPath = path.join(__dirname, 'src', 'lessons', lessonId, 'exercises.abc');
    if (!fs.existsSync(abcPath)) return '[]';
    const text = fs.readFileSync(abcPath, 'utf-8');
    return JSON.stringify(splitAbcTunes(text));
  });

  eleventyConfig.addFilter('lessonPages', function (allPages) {
    return sortLessons(allPages);
  });

  eleventyConfig.addFilter('lessonNav', function (allPages, currentPage) {
    const currentUrl = currentPage && currentPage.url;
    const lessons = sortLessons(allPages);
    const idx = lessons.findIndex(p => p.url === currentUrl);
    const prev = idx > 0 ? lessons[idx - 1] : null;
    const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;
    return { prev, next, idx, total: lessons.length };
  });

  // Add the base plugin to handle GitHub Pages subpaths
  const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addGlobalData('eleventyComputed', {
    strudelCode: (data) => {
      // If we are in a folder with a song.strudel, use that for the Markdown page
      if (data.page.inputPath.endsWith('.md')) {
        const songPath = path.join(path.dirname(data.page.inputPath), 'song.strudel');
        if (fs.existsSync(songPath)) {
          return fs.readFileSync(songPath, 'utf-8');
        }
      }
      return data.strudelCode;
    },
    abcSource: (data) => {
      if (data.page.inputPath.endsWith('.md')) {
        const dir = path.dirname(data.page.inputPath);
        const companions = ['song.abc', 'exercises.abc'];
        for (let i = 0; i < companions.length; i++) {
          const songPath = path.join(dir, companions[i]);
          if (fs.existsSync(songPath)) {
            return fs.readFileSync(songPath, 'utf-8');
          }
        }
      }
      return data.abcSource;
    },
    abcSong: (data) => {
      const src = data.abcSource;
      if (!src) return data.abcSong || null;
      const result = parseAbc(src);
      return {
        title: result.title,
        tempo: result.tempo || 80,
        notes: result.notes,
        rests: result.rests,
        timeSignature: result.timeSignature,
        keySignature: result.keySignature,
        abc: src,
      };
    },
  });

  // Only use pathPrefix if we are in a GitHub Actions environment
  const pathPrefix = process.env.GITHUB_ACTIONS ? "/my-strudel/" : "/";

  return {
    pathPrefix: pathPrefix,
    dir: {
      input: 'src',
      output: '_site',
    },
  };
};

const strudelExtension = {
  compile: async (inputContent) => {
    return async (data) => {
      // Don't render song.strudel files as their own pages
      if (data.page.fileSlug === 'song') {
        return;
      }
      return inputContent;
    };
  },
  getData: async (inputPath) => {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const { getMetadata } = require('./metadata-parser.js');
    const metadata = getMetadata(content);
    
    const filename = path.basename(inputPath);
    const parentDir = path.basename(path.dirname(inputPath));
    
    // If the file is named 'song.strudel', use the folder name as the title
    let title = metadata.title;
    if (!title) {
        title = filename === 'song.strudel' || filename === 'song.tidal' 
            ? parentDir 
            : filename.replace(/\.(strudel|tidal)$/, '');
    }

    return {
      title: title,
      type: 'strudel',
      strudelCode: content,
      // Prevent song.strudel from being generated as a standalone page
      permalink: filename === 'song.strudel' || filename === 'song.tidal' ? false : undefined
    };
  },
};

function isAbcCompanionFile(inputPath) {
  const norm = inputPath.replace(/\\/g, '/');
  const base = path.basename(norm);
  if (base === 'song.abc' || base === 'exercises.abc') return true;
  if (norm.includes('/songs/sight-reading/songs/')) return true;
  if (norm.includes('/lessons/') && base.endsWith('.abc')) return true;
  return false;
}

const abcExtension = {
  compile: async (inputContent) => {
    return async (data) => {
      if (isAbcCompanionFile(data.page.inputPath) || data.page.fileSlug === 'song') {
        return;
      }
      return '';
    };
  },
  getData: async (inputPath) => {
    if (isAbcCompanionFile(inputPath)) {
      return {
        permalink: false,
        eleventyExcludeFromCollections: true,
      };
    }
    const content = fs.readFileSync(inputPath, 'utf-8');
    const result = parseAbc(content);
    const filename = path.basename(inputPath);
    const parentDir = path.basename(path.dirname(inputPath));
    const title = result.title
      || (filename === 'song.abc' ? parentDir : filename.replace(/\.abc$/, ''));
    return {
      title,
      type: 'abc',
      abcSource: content,
      abcSong: {
        title: result.title || title,
        tempo: result.tempo || 80,
        notes: result.notes,
        rests: result.rests,
        timeSignature: result.timeSignature,
        keySignature: result.keySignature,
        abc: content,
      },
    };
  },
};