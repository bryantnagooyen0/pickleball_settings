import mongoose from 'mongoose';
import dns from 'dns';

// Node.js on Windows falls back to TCP for SRV queries, which some routers block.
// Use public DNS servers that support TCP to ensure mongodb+srv:// works locally.
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pickleball_settings');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // process code 1 code means exit with failure, 0 means success
  }
};
