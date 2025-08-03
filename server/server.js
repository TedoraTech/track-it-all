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
const { connectDB } = require('./src/config/database');
const SwaggerConfig = require('./src/config/swagger');

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

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/posts`, postRoutes);
app.use(`${apiPrefix}/posts/:postId/replies`, replyRoutes);
app.use(`${apiPrefix}/chats`, chatRoutes);
app.use(`${apiPrefix}/chats/:chatId/messages`, messageRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);

// Setup Swagger documentation from YAML files
const swaggerConfig = new SwaggerConfig();
swaggerConfig.setupSwaggerUI(app);

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

// 404 handler for API routes
app.use(`${apiPrefix}/*`, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    swagger: `${req.protocol}://${req.get('host')}/api-docs`,
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Student Hub API',
    version: '1.0.0',
    documentation: {
      swagger: `${req.protocol}://${req.get('host')}/api-docs`,
      interactive: `${req.protocol}://${req.get('host')}/api-docs`,
      description: 'Interactive API documentation with Swagger UI'
    },
    health: `${req.protocol}://${req.get('host')}/health`,
    endpoints: {
      authentication: `${req.protocol}://${req.get('host')}/api-docs#/Authentication`,
      posts: `${req.protocol}://${req.get('host')}/api-docs#/Posts`,
      replies: `${req.protocol}://${req.get('host')}/api-docs#/Replies`,
      chats: `${req.protocol}://${req.get('host')}/api-docs#/Chats`,
      messages: `${req.protocol}://${req.get('host')}/api-docs#/Messages`,
      analytics: `${req.protocol}://${req.get('host')}/api-docs#/Analytics`
    },
    apiRoutes: {
      auth: `${req.protocol}://${req.get('host')}/api/auth`,
      posts: `${req.protocol}://${req.get('host')}/api/posts`,
      chats: `${req.protocol}://${req.get('host')}/api/chats`,
      analytics: `${req.protocol}://${req.get('host')}/api/analytics/visa`
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Export the Express app (don't start server here)
module.exports = app;
