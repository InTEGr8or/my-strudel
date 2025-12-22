const { getMetadata } = require('./metadata-parser.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addTemplateFormats('strudel,tidal');

  eleventyConfig.addExtension('strudel', strudelExtension);
  eleventyConfig.addExtension('tidal', strudelExtension);

  eleventyConfig.addPassthroughCopy('src/js');
  eleventyConfig.addPassthroughCopy('src/css');

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
};

const strudelExtension = {
  compile: async (inputContent) => {
    return async (data) => {
      return inputContent;
    };
  },
  getData: async (inputPath) => {
    const fs = require('fs');
    const content = fs.readFileSync(inputPath, 'utf-8');
    const { getMetadata } = require('./metadata-parser.js');
    const metadata = getMetadata(content);
    return {
      title: metadata.title || inputPath.split('/').pop().replace(/\.(strudel|tidal)$/, ''),
      strudelCode: content,
    };
  },
};
