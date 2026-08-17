/**
 * Moves paddle images off individual Player documents and onto the shared
 * Paddle document they all describe.
 *
 * Players reference paddles by name (Player.paddle is a String, not a ref), so
 * matching is done on exact name equality — the same rule the frontend already
 * uses in PlayerDetailPage.
 *
 * Phase 1: promote a player's paddleImage up to the Paddle that has none.
 * Phase 2: clear Player.paddleImage where it now duplicates the Paddle's image,
 *          so the player inherits it and there is one place to fix a dead link.
 *
 * Dry run by default. Pass --apply to write.
 *
 *   node scripts/migrate-paddle-images.js
 *   node scripts/migrate-paddle-images.js --apply
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';

dotenv.config();

const apply = process.argv.includes('--apply');

const hasImage = value => typeof value === 'string' && value.trim() !== '';

// Picks the image used by the most players, so one stale outlier can't win.
function mostCommon(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
}

async function main() {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/pickleball_settings'
  );
  console.log(`Connected${apply ? '' : ' (dry run — nothing will be written)'}\n`);

  const [players, paddles] = await Promise.all([
    Player.find({}).lean(),
    Paddle.find({}).lean(),
  ]);

  const paddlesByName = new Map(paddles.map(p => [p.name, p]));

  // Group every player-held paddle image under the paddle name it belongs to.
  const imagesByPaddleName = new Map();
  const unmatched = [];

  for (const player of players) {
    if (!hasImage(player.paddleImage)) continue;
    if (!paddlesByName.has(player.paddle)) {
      unmatched.push(player);
      continue;
    }
    const list = imagesByPaddleName.get(player.paddle) || [];
    list.push(player.paddleImage.trim());
    imagesByPaddleName.set(player.paddle, list);
  }

  // ---- Phase 1: promote images onto paddles that lack one ----
  const promotions = [];
  const conflicts = [];

  for (const [paddleName, images] of imagesByPaddleName) {
    const paddle = paddlesByName.get(paddleName);
    const distinct = [...new Set(images)];

    if (distinct.length > 1) {
      conflicts.push({ paddleName, distinct });
    }
    if (hasImage(paddle.image)) continue;

    const [winner, count] = mostCommon(images);
    promotions.push({ paddleId: paddle._id, paddleName, image: winner, count });
  }

  console.log(`Phase 1 — promote image onto Paddle (${promotions.length}):`);
  if (!promotions.length) console.log('  nothing to do');
  for (const p of promotions) {
    console.log(`  ${p.paddleName}`);
    console.log(`    ← ${p.image}  (from ${p.count} player${p.count === 1 ? '' : 's'})`);
  }

  if (apply) {
    for (const p of promotions) {
      await Paddle.updateOne({ _id: p.paddleId }, { $set: { image: p.image } });
      paddlesByName.get(p.paddleName).image = p.image;
    }
  } else {
    for (const p of promotions) {
      paddlesByName.get(p.paddleName).image = p.image;
    }
  }

  // ---- Phase 2: clear redundant copies on players ----
  const clears = [];
  for (const player of players) {
    if (!hasImage(player.paddleImage)) continue;
    const paddle = paddlesByName.get(player.paddle);
    if (!paddle) continue;
    if (paddle.image === player.paddleImage.trim()) {
      clears.push(player);
    }
  }

  console.log(`\nPhase 2 — clear duplicate Player.paddleImage (${clears.length}):`);
  if (!clears.length) console.log('  nothing to do');
  for (const player of clears) {
    console.log(`  ${player.name} → inherits from "${player.paddle}"`);
  }

  if (apply && clears.length) {
    await Player.updateMany(
      { _id: { $in: clears.map(p => p._id) } },
      { $unset: { paddleImage: '' } }
    );
  }

  // ---- Things a human needs to look at ----
  if (conflicts.length) {
    console.log(`\nConflicts — same paddle, different images (${conflicts.length}):`);
    for (const c of conflicts) {
      console.log(`  ${c.paddleName}`);
      for (const img of c.distinct) console.log(`    - ${img}`);
    }
    console.log('  (most common was used; players keeping a different image were left alone)');
  }

  if (unmatched.length) {
    console.log(`\nNo matching Paddle document (${unmatched.length}) — left untouched:`);
    for (const player of unmatched) {
      console.log(`  ${player.name} — paddle: "${player.paddle}"`);
    }
  }

  console.log(
    apply
      ? `\nDone. ${promotions.length} paddle(s) updated, ${clears.length} player field(s) cleared.`
      : '\nDry run complete — re-run with --apply to write these changes.'
  );

  await mongoose.disconnect();
}

main().catch(async err => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
