const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import configurations
require('dotenv').config();
const logger = require('./src/config/logger');
const { connectRedis } = require('./src/config/redis');
const { connectDB } = require('./src/config/database');

// Import middleware
const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth');
const postRoutes = require('./src/routes/posts');
const replyRoutes = require('./src/routes/replies');
const chatRoutes = require('./src/routes/chats');
const messageRoutes = require('./src/routes/messages');
const analyticsRoutes = require('./src/routes/analytics');

// Create Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'avatars'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'messages'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'general'), { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Student Hub API is healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/posts`, postRoutes);
app.use(`${apiPrefix}/posts/:postId/replies`, replyRoutes);
app.use(`${apiPrefix}/chats`, chatRoutes);
app.use(`${apiPrefix}/chats/:chatId/messages`, messageRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);

// API documentation endpoint
app.get(`${apiPrefix}/docs`, (req, res) => {
  res.json({
    success: true,
    message: 'Student Hub API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/logout': 'Logout user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/change-password': 'Change password',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password',
      },
      posts: {
        'GET /api/posts': 'Get all posts with filtering and pagination',
        'GET /api/posts/:id': 'Get a single post',
        'POST /api/posts': 'Create a new post',
        'PUT /api/posts/:id': 'Update a post',
        'DELETE /api/posts/:id': 'Delete a post',
        'POST /api/posts/:id/vote': 'Vote on a post',
        'POST /api/posts/:id/bookmark': 'Bookmark/unbookmark a post',
      },
      replies: {
        'GET /api/posts/:postId/replies': 'Get all replies for a post',
        'POST /api/posts/:postId/replies': 'Create a new reply',
        'PUT /api/posts/:postId/replies/:replyId': 'Update a reply',
        'DELETE /api/posts/:postId/replies/:replyId': 'Delete a reply',
        'POST /api/posts/:postId/replies/:replyId/vote': 'Vote on a reply',
        'POST /api/posts/:postId/replies/:replyId/accept': 'Accept a reply as answer',
      },
      chats: {
        'GET /api/chats': 'Get user\'s joined chats',
        'GET /api/chats/discover': 'Discover available chats to join',
        'POST /api/chats': 'Create a new chat',
        'GET /api/chats/:id': 'Get chat details',
        'POST /api/chats/:id/join': 'Join a chat',
        'POST /api/chats/:id/leave': 'Leave a chat',
      },
      messages: {
        'GET /api/chats/:chatId/messages': 'Get messages for a chat',
        'POST /api/chats/:chatId/messages': 'Send a message',
        'PUT /api/chats/:chatId/messages/:messageId': 'Edit a message',
        'DELETE /api/chats/:chatId/messages/:messageId': 'Delete a message',
        'POST /api/chats/:chatId/messages/mark-read': 'Mark messages as read',
      },
      analytics: {
        'GET /api/analytics/visa': 'Get visa analytics and statistics',
        'GET /api/analytics/visa/cases': 'Get user\'s visa cases',
        'POST /api/analytics/visa/cases': 'Create a new visa case',
        'PUT /api/analytics/visa/cases/:id': 'Update a visa case',
        'GET /api/analytics/visa/cases/:id/timeline': 'Get visa case timeline',
        'DELETE /api/analytics/visa/cases/:id': 'Delete a visa case',
      },
    },
  });
});

// 404 handler for API routes
app.use(`${apiPrefix}/*`, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: `${req.protocol}://${req.get('host')}${apiPrefix}/docs`,
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Student Hub API',
    documentation: `${req.protocol}://${req.get('host')}${apiPrefix}/docs`,
    health: `${req.protocol}://${req.get('host')}/health`,
    version: '1.0.0',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    const { mongoose } = require('./src/config/database');
    await mongoose.connection.close();
    logger.info('Database connection closed');
    
    // Close Redis connection
    const { disconnectRedis } = require('./src/config/redis');
    await disconnectRedis();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connection established successfully');

    // Connect to Redis
    await connectRedis();

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: http://localhost:${PORT}${apiPrefix}/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
