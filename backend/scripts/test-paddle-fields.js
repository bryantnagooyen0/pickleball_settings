import mongoose from 'mongoose';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';

const testPaddleFields = async () => {
  try {
    // Connect to MongoDB with hardcoded connection string
    await mongoose.connect('mongodb://localhost:27017/pickleball_settings');
    console.log('Connected to MongoDB');

    // Test Paddle model
    console.log('\n=== Testing Paddle Model ===');
    const paddles = await Paddle.find({});
    console.log(`Found ${paddles.length} paddles`);
    
    if (paddles.length > 0) {
      const samplePaddle = paddles[0];
      console.log('Sample paddle fields:', {
        name: samplePaddle.name,
        length: samplePaddle.length,
        width: samplePaddle.width,
        hasLength: samplePaddle.hasOwnProperty('length'),
        hasWidth: samplePaddle.hasOwnProperty('width')
      });
    }

    // Test Player model
    console.log('\n=== Testing Player Model ===');
    const players = await Player.find({});
    console.log(`Found ${players.length} players`);
    
    if (players.length > 0) {
      const samplePlayer = players[0];
      console.log('Sample player paddle fields:', {
        name: samplePlayer.name,
        paddle: samplePlayer.paddle,
        paddleLength: samplePlayer.paddleLength,
        paddleWidth: samplePlayer.paddleWidth,
        hasPaddleLength: samplePlayer.hasOwnProperty('paddleLength'),
        hasPaddleWidth: samplePlayer.hasOwnProperty('paddleWidth')
      });
    }

    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the test
testPaddleFields();
