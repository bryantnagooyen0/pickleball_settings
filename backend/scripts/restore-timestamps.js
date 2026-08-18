/**
 * Restores createdAt/updatedAt from a snapshot without touching anything else.
 *
 * The image scripts used updateOne(), and Mongoose applies `timestamps: true`
 * on updates by default — so they overwrote every document's updatedAt and
 * wiped the real edit history that "Recently Updated" sorts by. This puts the
 * original timestamps back while leaving the migrated image paths in place.
 *
 *   node scripts/restore-timestamps.js <snapshot.json>
 *   node scripts/restore-timestamps.js <snapshot.json> --apply
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';

dotenv.config();

const apply = process.argv.includes('--apply');
const file = process.argv.slice(2).find(a => !a.startsWith('--'));

async function main() {
  if (!file) throw new Error('Pass the snapshot path.');
  const snapshot = JSON.parse(readFileSync(file, 'utf8'));

  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/pickleball_settings'
  );
  console.log(
    `Snapshot from ${snapshot.takenAt}${apply ? '' : '  (dry run)'}\n`
  );

  let restored = 0;
  let alreadyCorrect = 0;

  for (const [docs, Model] of [
    [snapshot.players, Player],
    [snapshot.paddles, Paddle],
  ]) {
    for (const doc of docs) {
      const current = await Model.findById(doc._id).lean();
      if (!current) continue;

      const want = new Date(doc.updatedAt).getTime();
      if (new Date(current.updatedAt).getTime() === want) {
        alreadyCorrect += 1;
        continue;
      }

      if (apply) {
        // timestamps:false is the whole point — otherwise this re-breaks it.
        await Model.updateOne(
          { _id: doc._id },
          { $set: { createdAt: doc.createdAt, updatedAt: doc.updatedAt } },
          { timestamps: false }
        );
      }
      restored += 1;
    }
  }

  console.log(`${apply ? 'Restored' : 'Would restore'} ${restored} document(s).`);
  console.log(`${alreadyCorrect} already had the right timestamp.`);
  if (!apply) console.log('\nRe-run with --apply to write.');

  await mongoose.disconnect();
}

main().catch(async err => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
