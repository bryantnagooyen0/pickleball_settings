/**
 * Snapshot / restore the two collections the image scripts touch.
 *
 *   node scripts/backup-restore.js backup
 *   node scripts/backup-restore.js restore backups/<file>.json
 *
 * Restore overwrites the Player and Paddle documents in the snapshot with
 * exactly the values they had when it was taken. Documents created after the
 * snapshot are left alone.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = join(__dirname, 'backups');

const [, , command, fileArg] = process.argv;

async function backup() {
  const [players, paddles] = await Promise.all([
    Player.find({}).lean(),
    Paddle.find({}).lean(),
  ]);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = join(BACKUP_DIR, `snapshot-${stamp}.json`);

  mkdirSync(BACKUP_DIR, { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({ takenAt: new Date().toISOString(), players, paddles }, null, 2)
  );

  console.log(`Backed up ${players.length} players and ${paddles.length} paddles`);
  console.log(`  → ${path}`);
}

async function restore(file) {
  if (!file) throw new Error('Pass the snapshot path to restore.');
  const snapshot = JSON.parse(readFileSync(file, 'utf8'));

  console.log(`Restoring snapshot from ${snapshot.takenAt}...`);

  for (const doc of snapshot.players) {
    const { _id, ...fields } = doc;
    await Player.replaceOne({ _id }, fields);
  }
  for (const doc of snapshot.paddles) {
    const { _id, ...fields } = doc;
    await Paddle.replaceOne({ _id }, fields);
  }

  console.log(
    `Restored ${snapshot.players.length} players and ${snapshot.paddles.length} paddles`
  );
}

async function main() {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/pickleball_settings'
  );

  if (command === 'backup') await backup();
  else if (command === 'restore') await restore(fileArg);
  else {
    console.log('Usage:');
    console.log('  node scripts/backup-restore.js backup');
    console.log('  node scripts/backup-restore.js restore backups/<file>.json');
  }

  await mongoose.disconnect();
}

main().catch(async err => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
