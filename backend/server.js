import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connectDB } from './config/db.js';
import playerRoutes from './routes/player.route.js';
import paddleRoutes from './routes/paddle.route.js';
import commentRoutes from './routes/comment.route.js';
import userRoutes from './controllers/users_controller.mjs';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow all origins for now
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint 
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple ping endpoint for faster checks
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// API Routes
app.use('/api/players', playerRoutes);
app.use('/api/paddles', paddleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler - fixed version
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Optimize for faster cold starts
app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Connect to database asynchronously to avoid blocking startup
  try {
    await connectDB();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});