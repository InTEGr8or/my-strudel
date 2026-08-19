#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Running linter...');

const filesToLint = [
  'src/js/mini-repl.js',
  'src/js/note-chart.js',
  'src/js/tape-trainer.js',
  'src/js/step-trainer.js',
  'src/js/trainer.js',
  'src/js/trainer-utils.js',
  'src/js/duration.js',
  'src/js/staff-layout.js',
  'src/js/staff-player.js',
  'src/js/freq-lab.js',
  'src/js/trainer-store.js',
  'src/js/baby-steps.js',
  'src/js/abc-highlight.js',
  'src/js/abc-source.js',
  'src/shared/parse-abc.js',
  'src/shared/lesson-order.js',
  'scripts/build-musescore.js',
  'scripts/musicxml-to-abc.js',
  'scripts/verify-midi-abc.js',
  'scripts/run-tests.js',
  'test/bar-structure.test.js',
  'test/song-selector.test.js',
  'test/trainer-layout.test.js',
  'test/midi-abc-align.test.js',
  'test/trainer-store.test.js',
  'test/abc-pages.test.js',
  'test/baby-steps.test.js',
  'test/abc-source.test.js',
  'test/lesson-foundations.test.js',
  'test/lesson-order.test.js',
  'test/staff-player.test.js',
  'test/freq-lab.test.js',
];

let hasError = false;

for (const file of filesToLint) {
  const fullPath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, 'utf-8');

  try {
    if (process.execArgv.includes('--experimental-vm-modules') && typeof vm.SourceTextModule === 'function') {
      try {
        new vm.SourceTextModule(content, { identifier: file });
        console.log(`  ✓ ${file}`);
        continue;
      } catch (_) {
        // Fallback to vm.Script comment-stripping syntax validator
      }
    }

    // Comment out top-level import/export keywords so vm.Script validates JS syntax and variable scoping
    const scriptCode = content
      .split('\n')
      .map(line => {
        const t = line.trim();
        if (t.startsWith('import ') || t.startsWith('import{') || t.startsWith('export ') || t.startsWith('export{')) {
          return '// ' + line;
        }
        return line;
      })
      .join('\n');

    new vm.Script(scriptCode, { filename: file });
    console.log(`  ✓ ${file}`);
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\nLinting failed with syntax errors.');
  process.exit(1);
} else {
  console.log('\nAll JavaScript files passed syntax linting cleanly.');
}
