import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pickleball_settings');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // process code 1 code means exit with failure, 0 means success
  }
};
