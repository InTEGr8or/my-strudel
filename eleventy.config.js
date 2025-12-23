const { getMetadata } = require('./metadata-parser.js');
const path = require('path');
const fs = require('fs');

module.exports = function (eleventyConfig) {
  eleventyConfig.addTemplateFormats('strudel,tidal');

  eleventyConfig.addExtension('strudel', strudelExtension);
  eleventyConfig.addExtension('tidal', strudelExtension);

  eleventyConfig.addPassthroughCopy({ 'src/js': 'js' });
  eleventyConfig.addPassthroughCopy({ 'src/css': 'css' });

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
    }
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
      strudelCode: content,
      // Prevent song.strudel from being generated as a standalone page
      permalink: filename === 'song.strudel' || filename === 'song.tidal' ? false : undefined
    };
  },
};