import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop the unique index on paddle name field if it exists
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('paddles');
      await collection.dropIndex('name_1');
      console.log('Successfully dropped unique index on paddle name field');
    } catch (error) {
      console.log('Paddle name index already dropped or does not exist');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // process code 1 code means exit with failure, 0 means success
  }
};
