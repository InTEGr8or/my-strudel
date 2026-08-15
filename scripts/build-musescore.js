const fs = require('fs');
const path = require('path');
const { generateAbc } = require('./musicxml-to-abc');

function getFilesRecursively(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function convertMuseScoreIncremental(srcDir, destDir) {
  // Remove unverified top-level .abc files not from MuseScore
  const unverified = ['hotcross.abc', 'jingle.abc', 'mary.abc', 'minuet.abc', 'ode.abc', 'speed-the-plough.abc', 'twinkle.abc'];
  for (const f of unverified) {
    const p = path.join(destDir, f);
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch (_) {}
    }
  }

  // Remove any leftover subdirectories in destDir to prevent duplicate song entries
  if (fs.existsSync(destDir)) {
    const entries = fs.readdirSync(destDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try { fs.rmSync(path.join(destDir, entry.name), { recursive: true, force: true }); } catch (_) {}
      }
    }
  }

  const mxlFiles = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.mxl') || f.endsWith('.musicxml') || (f.endsWith('.xml') && !f.includes('container')))
    .map(f => path.join(srcDir, f));
  let convertedCount = 0;
  let skippedCount = 0;

  for (const srcPath of mxlFiles) {
    const relPath = path.relative(srcDir, srcPath);
    const abcRelPath = relPath.replace(/\.(mxl|xml|musicxml)$/i, '.abc');
    const destPath = path.join(destDir, abcRelPath);

    const srcStat = fs.statSync(srcPath);
    let needsBuild = true;

    if (fs.existsSync(destPath)) {
      const destStat = fs.statSync(destPath);
      if (destStat.mtimeMs >= srcStat.mtimeMs) {
        needsBuild = false;
      }
    }

    if (needsBuild) {
      try {
        const destFolder = path.dirname(destPath);
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }
        const abcContent = generateAbc(srcPath);
        let contentChanged = true;
        if (fs.existsSync(destPath)) {
          const existingContent = fs.readFileSync(destPath, 'utf-8');
          if (existingContent === abcContent) {
            contentChanged = false;
          }
        }
        if (contentChanged) {
          fs.writeFileSync(destPath, abcContent, 'utf-8');
          console.log(`[MuseScore Convert] Converted ${relPath} -> ${abcRelPath}`);
          convertedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`[MuseScore Convert Error] Failed ${relPath}: ${err.message}`);
      }
    } else {
      skippedCount++;
    }
  }

  if (convertedCount > 0) {
    console.log(`[MuseScore Build] Converted ${convertedCount} new/updated song(s), skipped ${skippedCount} up-to-date song(s).`);
  } else {
    console.log(`[MuseScore Build] All ${skippedCount} MuseScore song(s) are up-to-date.`);
  }
}

if (require.main === module) {
  const srcDir = path.join(__dirname, '..', 'data', 'musescore');
  const destDir = path.join(__dirname, '..', 'src', 'songs', 'sight-reading', 'songs', 'musescore');
  convertMuseScoreIncremental(srcDir, destDir);
}

module.exports = { convertMuseScoreIncremental, getFilesRecursively };
