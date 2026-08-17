#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const VERBOSE = /^(1|true|yes)$/i.test(String(process.env.VERBOSE || ''));
const color = process.stdout.isTTY;
const green = (s) => (color ? `\x1b[32m${s}\x1b[0m` : s);
const red = (s) => (color ? `\x1b[31m${s}\x1b[0m` : s);
const dim = (s) => (color ? `\x1b[2m${s}\x1b[0m` : s);

const root = path.join(__dirname, '..');

const suites = [
  { name: 'lint', cmd: ['node', 'scripts/lint.js'] },
  { name: 'bar-structure', cmd: ['node', 'test/bar-structure.test.js'] },
  { name: 'song-selector', cmd: ['node', 'test/song-selector.test.js'] },
  { name: 'trainer-layout', cmd: ['node', 'test/trainer-layout.test.js'] },
  { name: 'score-tempo', cmd: ['node', 'test/score-tempo.test.js'] },
  { name: 'midi-abc-align', cmd: ['node', 'test/midi-abc-align.test.js'] },
  { name: 'trainer-store', cmd: ['node', 'test/trainer-store.test.js'] },
  { name: 'abc-pages', cmd: ['node', 'test/abc-pages.test.js'] },
  { name: 'baby-steps', cmd: ['node', 'test/baby-steps.test.js'] },
];

const nameW = Math.max(...suites.map((s) => s.name.length));

function fmtMs(ms) {
  return ms >= 1000 ? (ms / 1000).toFixed(1) + 's' : ms + 'ms';
}

if (VERBOSE) {
  console.log(dim('VERBOSE=1  (full suite logs)'));
} else {
  console.log(dim('make test          compact'));
  console.log(dim('VERBOSE=1 make test  full logs'));
}

let failed = 0;
const t0 = Date.now();

for (const suite of suites) {
  const started = Date.now();
  const result = spawnSync(suite.cmd[0], suite.cmd.slice(1), {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    stdio: VERBOSE ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });
  const ms = Date.now() - started;
  const ok = result.status === 0;
  if (!ok) failed += 1;

  if (VERBOSE) {
    if (!ok) {
      console.error(red(`\n✗ ${suite.name} exited ${result.status}`));
    }
    continue;
  }

  const mark = ok ? green('✓') : red('✗');
  console.log(`${mark} ${suite.name.padEnd(nameW)}  ${fmtMs(ms)}`);
  if (!ok) {
    const dump = `${result.stdout || ''}${result.stderr || ''}`;
    if (dump.trim()) process.stdout.write(dump.endsWith('\n') ? dump : dump + '\n');
    if (result.error) console.error(result.error.message);
  }
}

const total = Date.now() - t0;
if (!VERBOSE) {
  console.log('');
  if (failed) {
    console.log(red(`${failed} failed`) + `  ${suites.length - failed} passed  ${fmtMs(total)}`);
  } else {
    console.log(green(`${suites.length} passed`) + `  ${fmtMs(total)}`);
  }
}

if (failed) process.exit(1);
