/**
 * Downloads every hotlinked image referenced by the database, saves an
 * optimized copy under frontend/public/, and repoints the database at the
 * local path — so vendor CDNs can rot without breaking the site.
 *
 * Runs against Player and Paddle, the only models that carry images.
 * A URL used in several places is downloaded once and shared.
 *
 * Dry run by default: it still fetches each URL so it can tell you which links
 * are already dead, but writes no files and touches no records.
 *
 *   node scripts/localize-images.js            # preview + liveness check
 *   node scripts/localize-images.js --apply    # download, optimize, repoint
 *
 * Safe to re-run: anything already pointing at a local path is skipped.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { createHash } from 'crypto';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', '..', 'frontend', 'public');
const MANUAL_DIR = join(__dirname, 'manual-images');
const MANIFEST_PATH = join(__dirname, 'manual-images.json');

const apply = process.argv.includes('--apply');

const MAX_DIMENSION = parseInt(process.env.MAX_DIMENSION || '800', 10);
const QUALITY = parseInt(process.env.QUALITY || '82', 10);
const CONCURRENCY = 6;

// Some CDNs reject requests without a browser-ish agent.
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// Which public/ subfolder each field's images belong in.
const FIELD_DIRS = {
  image: 'players',
  paddleImage: 'paddles',
  shoeImage: 'shoes',
  overgripImage: 'grips',
  weightImage: 'weights',
  additionalModificationImage: 'mods',
};

const PLAYER_FIELDS = Object.keys(FIELD_DIRS);

const EXT_BY_TYPE = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
};

const isRemote = v => typeof v === 'string' && /^https?:\/\//i.test(v.trim());

const slugify = text =>
  String(text)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'image';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** Collect every remote image reference, grouped by URL so we fetch each once. */
async function collectReferences() {
  const [players, paddles] = await Promise.all([
    Player.find({}).lean(),
    Paddle.find({}).lean(),
  ]);

  const byUrl = new Map();
  const add = (url, ref) => {
    const key = url.trim();
    if (!byUrl.has(key)) byUrl.set(key, { url: key, refs: [] });
    byUrl.get(key).refs.push(ref);
  };

  for (const p of players) {
    for (const field of PLAYER_FIELDS) {
      if (isRemote(p[field])) {
        add(p[field], { model: 'Player', id: p._id, name: p.name, field });
      }
    }
  }
  for (const p of paddles) {
    if (isRemote(p.image)) {
      add(p.image, { model: 'Paddle', id: p._id, name: p.name, field: 'image' });
    }
  }

  return [...byUrl.values()];
}

/**
 * Name the file after the first thing that references it, in that field's
 * folder. Shared URLs therefore land in one predictable, readable file.
 */
function planLocalPath(entry, taken) {
  const first = entry.refs[0];
  const dir = first.model === 'Paddle' ? 'paddles' : FIELD_DIRS[first.field];
  const base = slugify(first.name);

  let name = base;
  // Two different URLs can slugify identically; disambiguate with a URL hash.
  if (taken.has(`${dir}/${name}`)) {
    name = `${base}-${createHash('sha1').update(entry.url).digest('hex').slice(0, 6)}`;
  }
  taken.add(`${dir}/${name}`);
  return { dir, name };
}

async function fetchImage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'image/*,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const buffer = Buffer.from(await res.arrayBuffer());
  if (!buffer.length) throw new Error('empty response');
  if (type && !type.startsWith('image/')) throw new Error(`not an image (${type})`);

  return { buffer, type };
}

/** Resize/recompress, keeping the source format. Returns the encoded buffer. */
async function optimizeBuffer(buffer, ext) {
  const image = sharp(buffer).rotate();
  const meta = await image.metadata();

  let pipeline = image;
  if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (ext === '.png') return pipeline.png({ quality: QUALITY, compressionLevel: 9 }).toBuffer();
  if (ext === '.webp') return pipeline.webp({ quality: QUALITY }).toBuffer();
  if (ext === '.avif') return pipeline.avif({ quality: QUALITY }).toBuffer();
  if (ext === '.gif') return buffer; // don't flatten animations
  return pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
}

async function processEntry(entry, taken) {
  const { dir, name } = planLocalPath(entry, taken);
  try {
    const { buffer, type } = await fetchImage(entry.url);
    const ext = EXT_BY_TYPE[type] || '.jpg';
    const encoded = await optimizeBuffer(buffer, ext);
    // Small images can come out larger after re-encoding; keep the original.
    const optimized = encoded.length < buffer.length ? encoded : buffer;

    const filename = `${name}${ext}`;
    const localPath = `/${dir}/${filename}`;
    const absPath = join(PUBLIC_DIR, dir, filename);

    if (apply) {
      mkdirSync(join(PUBLIC_DIR, dir), { recursive: true });
      writeFileSync(absPath, optimized);
    }

    return {
      ok: true,
      entry,
      localPath,
      before: buffer.length,
      after: optimized.length,
      existed: existsSync(absPath),
    };
  } catch (err) {
    return { ok: false, entry, error: err.message };
  }
}

/**
 * Some vendor links are already dead, so no download can recover them. For
 * those, drop a saved image into scripts/manual-images/ and describe it in
 * manual-images.json; this adopts the file exactly like a downloaded one.
 */
async function adoptManualImages() {
  if (!existsSync(MANIFEST_PATH)) return { adopted: [], missing: [], unmatched: [] };

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const adopted = [];
  const missing = [];
  const unmatched = [];

  for (const item of manifest) {
    const sourcePath = join(MANUAL_DIR, item.file);
    if (!existsSync(sourcePath)) {
      missing.push(item);
      continue;
    }

    const original = readFileSync(sourcePath);
    const ext = extname(item.file).toLowerCase() || '.jpg';
    const encoded = await optimizeBuffer(original, ext);
    const optimized = encoded.length < original.length ? encoded : original;

    for (const target of item.targets) {
      const Model = target.model === 'Paddle' ? Paddle : Player;
      const doc = await Model.findOne({ name: target.name }).lean();
      if (!doc) {
        unmatched.push(target);
        continue;
      }

      const dir = target.model === 'Paddle' ? 'paddles' : FIELD_DIRS[target.field];
      const filename = `${slugify(target.name)}-${target.field.replace('Image', '')}${ext}`;
      const localPath = `/${dir}/${filename}`;

      if (apply) {
        mkdirSync(join(PUBLIC_DIR, dir), { recursive: true });
        writeFileSync(join(PUBLIC_DIR, dir, filename), optimized);
        await Model.updateOne(
          { _id: doc._id },
          { $set: { [target.field]: localPath } },
          { timestamps: false }
        );
      }

      adopted.push({
        localPath,
        target,
        before: original.length,
        after: optimized.length,
      });
    }
  }

  return { adopted, missing, unmatched };
}

/** Run tasks with a small concurrency cap so we stay polite to each host. */
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/pickleball_settings'
  );
  console.log(`Connected${apply ? '' : ' (dry run — no files written, no records changed)'}`);

  // Manual files first: they replace dead URLs, so the download pass below
  // won't waste time re-failing on links we already know are gone.
  const manual = await adoptManualImages();
  if (manual.adopted.length || manual.missing.length || manual.unmatched.length) {
    console.log(`\nManual images (${manual.adopted.length} adopted):`);
    for (const a of manual.adopted) {
      console.log(
        `  ok    ${a.localPath.padEnd(42)} ${formatBytes(a.before).padStart(9)} → ` +
          `${formatBytes(a.after).padStart(9)}  (${a.target.name} .${a.target.field})`
      );
    }
    for (const m of manual.missing) {
      console.log(`  --    waiting for file: scripts/manual-images/${m.file}`);
    }
    for (const u of manual.unmatched) {
      console.log(`  !!    no ${u.model} named "${u.name}" — check spelling`);
    }
  }

  const entries = await collectReferences();
  const refCount = entries.reduce((sum, e) => sum + e.refs.length, 0);
  console.log(
    `\n${entries.length} unique remote image(s) across ${refCount} reference(s).` +
      ` Downloading with ${CONCURRENCY} at a time...\n`
  );

  const taken = new Set();
  const results = await mapLimit(entries, CONCURRENCY, entry => processEntry(entry, taken));

  const succeeded = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);

  let totalBefore = 0;
  let totalAfter = 0;
  for (const r of succeeded) {
    totalBefore += r.before;
    totalAfter += r.after;
    const shared = r.entry.refs.length > 1 ? `  (shared by ${r.entry.refs.length})` : '';
    console.log(
      `  ok    ${r.localPath.padEnd(42)} ${formatBytes(r.before).padStart(9)} → ` +
        `${formatBytes(r.after).padStart(9)}${shared}`
    );
  }

  // Repoint the database at the local copies we just saved.
  let updatedRefs = 0;
  if (apply && succeeded.length) {
    for (const r of succeeded) {
      for (const ref of r.entry.refs) {
        const Model = ref.model === 'Paddle' ? Paddle : Player;
        await Model.updateOne(
          { _id: ref.id },
          { $set: { [ref.field]: r.localPath } },
          { timestamps: false }
        );
        updatedRefs += 1;
      }
    }
  } else {
    updatedRefs = succeeded.reduce((sum, r) => sum + r.entry.refs.length, 0);
  }

  if (failed.length) {
    console.log(`\nCould not download (${failed.length}) — these links are already dead:`);
    for (const f of failed) {
      const who = f.entry.refs
        .map(r => `${r.model} "${r.name}" .${r.field}`)
        .join(', ');
      console.log(`  ${f.error.padEnd(22)} ${f.entry.url}`);
      console.log(`  ${''.padEnd(22)} used by: ${who}`);
    }
    console.log('\n  These still point at the dead URL — replace them by hand, then re-run.');
  }

  console.log(
    `\n${succeeded.length} downloaded, ${failed.length} failed.\n` +
      `Saved images: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}\n` +
      `${apply ? 'Repointed' : 'Would repoint'} ${updatedRefs} database reference(s).`
  );

  if (!apply) {
    console.log('\nDry run — re-run with --apply to download and update records.');
  } else {
    console.log('\nRemember to commit the new files under frontend/public/.');
  }

  await mongoose.disconnect();
}

main().catch(async err => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
