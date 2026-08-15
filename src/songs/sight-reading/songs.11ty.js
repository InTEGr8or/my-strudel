const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../../shared/parse-abc');
const { getFilesRecursively } = require('../../../scripts/build-musescore');

module.exports = class {
  data() {
    return {
      permalink: '/songs/sight-reading/songs.json',
      layout: false,
      eleventyExcludeFromCollections: true,
    };
  }
  render(data) {
    return JSON.stringify(data.sightReadingSongs || [], null, 2);
  }
};
