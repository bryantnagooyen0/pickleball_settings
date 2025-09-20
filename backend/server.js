import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connectDB } from './config/db.js';
import playerRoutes from './routes/player.route.js';
import paddleRoutes from './routes/paddle.route.js';
import commentRoutes from './routes/comment.route.js';
import userRoutes from './controllers/users_controller.mjs';
import cors from 'cors';
import { securityMiddleware, additionalSecurity } from './middleware/security.js';
import { generalLimiter, authLimiter, commentLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityMiddleware);
app.use(additionalSecurity);

// Rate limiting
app.use(generalLimiter);

// CORS configuration - Simplified and more permissive for production
app.use(cors({
  origin: [
    'https://www.pickleballsettings.com',
    'https://pickleballsettings.com',
    'http://localhost:3000',
    'http://localhost:5173',
    /^https:\/\/pickleball-settings.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json({ limit: '10mb' })); // Add size limit

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