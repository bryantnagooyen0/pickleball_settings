import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connectDB } from './config/db.js';
import playerRoutes from './routes/player.route.js';
import paddleRoutes from './routes/paddle.route.js';
import userRoutes from './controllers/users_controller.mjs';
import cors from 'cors';

dotenv.config({ path: path.resolve('./backend/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // In production, only allow your frontend URL
    const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json()); //allows us to accept JSON data in the req.body

app.use('/api/players', playerRoutes);
app.use('/api/paddles', paddleRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log('Server started at http://localhost:' + PORT);
});
