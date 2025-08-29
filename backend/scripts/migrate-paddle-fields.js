import mongoose from 'mongoose';
import Player from '../models/player.model.js';

const migratePaddleFields = async () => {
  try {
    // Connect to MongoDB with hardcoded connection string
    await mongoose.connect('mongodb://localhost:27017/pickleball_settings');
    console.log('Connected to MongoDB');

    // Find all players that don't have paddleLength or paddleWidth fields
    const players = await Player.find({
      $or: [
        { paddleLength: { $exists: false } },
        { paddleWidth: { $exists: false } }
      ]
    });

    console.log(`Found ${players.length} players that need migration`);

    // Update each player to add the missing fields
    for (const player of players) {
      await Player.findByIdAndUpdate(player._id, {
        $set: {
          paddleLength: player.paddleLength || '',
          paddleWidth: player.paddleWidth || ''
        }
      });
      console.log(`Updated player: ${player.name}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migratePaddleFields();
