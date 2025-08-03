#!/usr/bin/env node

/**
 * Student Hub Backend Server
 * 
 * This script starts the Express server with Socket.io support
 * and initializes all necessary services and middleware.
 */

const http = require('http');
const chalk = require('chalk');
const app = require('./server');
const socketService = require('./src/utils/socketService');
const logger = require('./src/config/logger');
const seedData = require('./src/seeders/seedData');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
socketService.initialize(server);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close the HTTP server
    server.close(async (err) => {
      if (err) {
        logger.error('Error closing HTTP server:', err);
        process.exit(1);
      }
      
      // Close database connection
      try {
        const { mongoose } = require('./src/models');
        await mongoose.connection.close();
        logger.info('Database connection closed');
      } catch (dbError) {
        logger.error('Error closing database connection:', dbError);
      }
      
      logger.info('HTTP server closed');
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });
    
    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
    
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    const { connectDB } = require('./src/config/database');
    
    await connectDB();
    logger.info('MongoDB connection established successfully');

    // Seed initial data if needed
    if (process.env.NODE_ENV === 'development') {
      if (process.env.SEED_DATABASE === 'true') {
        logger.info('Seeding database with initial data...');
        await seedData();
      }
    }

    // Start listening for connections
    server.listen(PORT, () => {
      // Enhanced server startup with comprehensive documentation info
      console.log('');
      console.log('🚀 ================================');
      console.log('   STUDENT HUB API SERVER READY');
      console.log('🚀 ================================');
      console.log('');
      console.log(`📡 Server Status: ${chalk.green('✓ RUNNING')}`);
      console.log(`🌐 Environment: ${chalk.cyan(process.env.NODE_ENV || 'development')}`);
      console.log(`🔗 Server URL: ${chalk.blue(`http://localhost:${PORT}`)}`);
      console.log(`📚 API Documentation: ${chalk.magenta(`http://localhost:${PORT}/api-docs`)}`);
      console.log(`💾 Database: ${chalk.green('✓ CONNECTED')}`);
      console.log(`🔐 Authentication: ${chalk.green('✓ JWT ENABLED')}`);
      console.log('');
      console.log('📋 API DOCUMENTATION SUMMARY:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🔐 Authentication Routes: ${chalk.yellow('/api/auth/*')}`);
      console.log('   • POST /register - Register new user account');
      console.log('   • POST /login - Login with email and password');
      console.log('   • GET /me - Get current user profile');
      console.log('   • PUT /profile - Update user profile');
      console.log('   • POST /logout - Logout and invalidate tokens');
      console.log('');
      console.log(`📝 Posts & Community: ${chalk.yellow('/api/posts/*')}`);
      console.log('   • GET / - Browse all posts with filters');
      console.log('   • POST / - Create new community post');
      console.log('   • GET /:id - View specific post details');
      console.log('   • PUT /:id - Update post (author only)');
      console.log('   • DELETE /:id - Delete post (author/admin)');
      console.log('   • POST /:id/vote - Vote on posts (upvote/downvote)');
      console.log('   • POST /:id/bookmark - Bookmark posts for later');
      console.log('');
      console.log(`💬 Replies & Discussions: ${chalk.yellow('/api/posts/:postId/replies/*')}`);
      console.log('   • GET / - Get all replies to a post');
      console.log('   • POST / - Reply to community posts');
      console.log('   • PUT /:replyId - Edit your replies');
      console.log('   • DELETE /:replyId - Delete replies');
      console.log('   • POST /:replyId/vote - Vote on replies');
      console.log('   • POST /:replyId/accept - Accept as best answer');
      console.log('');
      console.log(`💬 Chat & Messaging: ${chalk.yellow('/api/chats/*')}`);
      console.log('   • GET / - Your joined chat rooms');
      console.log('   • GET /discover - Discover public chats');
      console.log('   • POST / - Create new chat room');
      console.log('   • GET /:id - Get chat details and members');
      console.log('   • POST /:id/join - Join existing chat rooms');
      console.log('   • POST /:id/leave - Leave chat rooms');
      console.log('');
      console.log(`📨 Chat Messages: ${chalk.yellow('/api/chats/:chatId/messages/*')}`);
      console.log('   • GET / - Get chat message history');
      console.log('   • POST / - Send messages in chats');
      console.log('   • PUT /:messageId - Edit your messages');
      console.log('   • DELETE /:messageId - Delete messages');
      console.log('   • POST /mark-read - Mark messages as read');
      console.log('');
      console.log(`📊 Visa Analytics: ${chalk.yellow('/api/analytics/*')}`);
      console.log('   • GET /visa - Get visa processing statistics');
      console.log('   • GET /visa/cases - Your visa case tracking');
      console.log('   • POST /visa/cases - Create new visa case');
      console.log('   • PUT /visa/cases/:id - Update case status');
      console.log('   • GET /visa/cases/:id/timeline - Case timeline');
      console.log('   • GET /university - University analytics');
      console.log('   • GET /community - Community engagement stats');
      console.log('');
      console.log('🔧 QUICK TEST ENDPOINTS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🏥 Health Check: ${chalk.green(`http://localhost:${PORT}/health`)}`);
      console.log(`📊 API Status: ${chalk.green(`http://localhost:${PORT}/api/auth/health`)}`);
      console.log(`🌍 CORS Test: ${chalk.green(`curl -H "Origin: http://localhost:3000" http://localhost:${PORT}/health`)}`);
      console.log('');
      console.log('💡 DEVELOPMENT TIPS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📖 Interactive API Docs: ${chalk.blue(`http://localhost:${PORT}/api-docs`)}`);
      console.log(`🔍 Try API endpoints directly in Swagger UI`);
      console.log(`🔐 Use "Bearer <token>" for authenticated requests`);
      console.log(`📄 API accepts/returns JSON content-type`);
      console.log(`🚦 Rate limited: 100 requests per 15 minutes`);
      console.log('');
      console.log(`${chalk.green('✨ Ready to serve student community requests! ✨')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

    // Socket.io connection logging
    const io = socketService.io;
    if (io) {
      io.on('connection', (socket) => {
        logger.debug(`New socket connection: ${socket.id}`);
        
        // Optional: periodic logging of connected users
        if (process.env.NODE_ENV === 'development') {
          const connectedUsers = socketService.getConnectedUsersCount();
          logger.debug(`Connected users: ${connectedUsers}`);
        }
      });
    }

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
