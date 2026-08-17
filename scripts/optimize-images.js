import sharp from 'sharp';
import { readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname, basename } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Images are referenced from Mongo by exact path (e.g. "/players/ben-johns.png"),
// so we resize and recompress in place and never change the extension.
const DEFAULT_DIRS = [join(__dirname, '..', 'frontend', 'public', 'players')];

const MAX_DIMENSION = parseInt(process.env.MAX_DIMENSION || '600', 10);
const QUALITY = parseInt(process.env.QUALITY || '82', 10);
// Files already this small aren't worth rewriting — keeps the script idempotent.
const SKIP_UNDER_BYTES = parseInt(process.env.SKIP_UNDER_BYTES || '61440', 10);

const SUPPORTED = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const apply = process.argv.includes('--apply');
const dirArgs = process.argv.slice(2).filter(a => !a.startsWith('--'));
const targetDirs = dirArgs.length ? dirArgs : DEFAULT_DIRS;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function collectImages(dir) {
  return readdirSync(dir)
    .filter(name => SUPPORTED.has(extname(name).toLowerCase()))
    .map(name => join(dir, name))
    .filter(path => statSync(path).isFile());
}

// Re-encode in the file's existing format so the on-disk name never changes.
function encodeInPlaceFormat(pipeline, ext) {
  if (ext === '.png') return pipeline.png({ quality: QUALITY, compressionLevel: 9, palette: true });
  if (ext === '.webp') return pipeline.webp({ quality: QUALITY });
  return pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
}

async function optimize(path) {
  const ext = extname(path).toLowerCase();
  const before = statSync(path).size;
  const meta = await sharp(path).metadata();

  const oversized = meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION;
  if (!oversized && before < SKIP_UNDER_BYTES) {
    return { path, before, after: before, skipped: true };
  }

  // sharp can't stream a file onto itself; stage to a temp sibling and swap.
  const tmp = join(dirname(path), `.tmp-${basename(path)}`);
  let pipeline = sharp(path).rotate();
  if (oversized) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  await encodeInPlaceFormat(pipeline, ext).toFile(tmp);

  const after = statSync(tmp).size;

  // Never let an "optimization" make a file bigger.
  if (after >= before) {
    unlinkSync(tmp);
    return { path, before, after: before, skipped: true };
  }

  if (apply) {
    renameSync(tmp, path);
  } else {
    unlinkSync(tmp);
  }

  return { path, before, after, skipped: false, width: meta.width, height: meta.height };
}

async function main() {
  const files = targetDirs.flatMap(collectImages);
  if (!files.length) {
    console.log('No images found in:', targetDirs.join(', '));
    return;
  }

  console.log(
    `${apply ? 'Optimizing' : '[dry run] Would optimize'} ${files.length} image(s) ` +
      `— max ${MAX_DIMENSION}px, quality ${QUALITY}\n`
  );

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const file of files) {
    const result = await optimize(file);
    totalBefore += result.before;
    totalAfter += result.after;

    if (result.skipped) continue;
    changed += 1;

    const pct = ((1 - result.after / result.before) * 100).toFixed(0);
    console.log(
      `  ${basename(file).padEnd(28)} ${formatBytes(result.before).padStart(9)} → ` +
        `${formatBytes(result.after).padStart(9)}  (-${pct}%)`
    );
  }

  const saved = totalBefore - totalAfter;
  console.log(
    `\n${changed} changed, ${files.length - changed} already fine.\n` +
      `Total: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} ` +
      `(saved ${formatBytes(saved)})`
  );

  if (!apply) {
    console.log('\nDry run — nothing written. Re-run with --apply to write changes.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
