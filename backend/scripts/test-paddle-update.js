import mongoose from 'mongoose';
import Player from '../models/player.model.js';
import Paddle from '../models/paddle.model.js';

const testPaddleUpdate = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/pickleball_settings');
    console.log('Connected to MongoDB');

    // Test 1: Check current state
    console.log('\n=== Current State ===');
    const paddles = await Paddle.find({});
    const players = await Player.find({});
    
    console.log(`Found ${paddles.length} paddles and ${players.length} players`);
    
    if (paddles.length > 0) {
      const samplePaddle = paddles[0];
      console.log('Sample paddle:', {
        name: samplePaddle.name,
        length: samplePaddle.length,
        width: samplePaddle.width
      });
      
      // Find players using this paddle
      const playersUsingPaddle = await Player.find({ paddle: samplePaddle.name });
      console.log(`Players using "${samplePaddle.name}":`, playersUsingPaddle.length);
      
      if (playersUsingPaddle.length > 0) {
        const samplePlayer = playersUsingPaddle[0];
        console.log('Sample player paddle specs:', {
          name: samplePlayer.name,
          paddle: samplePlayer.paddle,
          paddleLength: samplePlayer.paddleLength,
          paddleWidth: samplePlayer.paddleWidth
        });
      }
    }

    // Test 2: Simulate paddle update
    if (paddles.length > 0) {
      const testPaddle = paddles[0];
      const playersUsingPaddle = await Player.find({ paddle: testPaddle.name });
      
      if (playersUsingPaddle.length > 0) {
        console.log('\n=== Testing Paddle Update ===');
        console.log(`Updating paddle "${testPaddle.name}" with new length and width`);
        
        // Update the paddle
        const updatedPaddle = await Paddle.findByIdAndUpdate(
          testPaddle._id, 
          { 
            length: '16.5 inches',
            width: '7.5 inches'
          }, 
          { new: true }
        );
        
        console.log('Paddle updated:', {
          name: updatedPaddle.name,
          length: updatedPaddle.length,
          width: updatedPaddle.width
        });
        
        // Check if players were updated
        const updatedPlayers = await Player.find({ paddle: testPaddle.name });
        console.log('\nPlayers after update:');
        updatedPlayers.forEach(player => {
          console.log(`- ${player.name}: length=${player.paddleLength}, width=${player.paddleWidth}`);
        });
      }
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
testPaddleUpdate();
