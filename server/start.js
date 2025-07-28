#!/usr/bin/env node

/**
 * Student Hub Backend Server
 * 
 * This script starts the Express server with Socket.io support
 * and initializes all necessary services and middleware.
 */

const http = require('http');
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
    server.close((err) => {
      if (err) {
        logger.error('Error closing HTTP server:', err);
        process.exit(1);
      }
      
      logger.info('HTTP server closed');
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
    // Test database connection and sync
    const { sequelize } = require('./src/models');
    
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synced successfully');
      
      // Seed initial data if needed
      if (process.env.SEED_DATABASE === 'true') {
        logger.info('Seeding database with initial data...');
        await seedData();
      }
    }

    // Connect to Redis
    const { connectRedis } = require('./src/config/redis');
    await connectRedis();

    // Start listening for connections
    server.listen(PORT, () => {
      logger.info(`🚀 Student Hub Server started successfully!`);
      logger.info(`📍 Server running on: http://localhost:${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`💓 Health Check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🔧 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
        logger.info(`🔴 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
        logger.info(`📁 File Storage: ${process.env.USE_S3 === 'true' ? 'AWS S3' : 'Local'}`);
      }
      
      logger.info(`✅ Server initialization complete!`);
    });

    // Socket.io connection logging
    const io = socketService.io;
    if (io) {
      io.on('connection', (socket) => {
        logger.debug(`New socket connection: ${socket.id}`);
        
        setInterval(() => {
          const connectedUsers = socketService.getConnectedUsersCount();
          if (connectedUsers > 0) {
            logger.debug(`Connected users: ${connectedUsers}`);
          }
        }, 30000); // Log every 30 seconds
      });
    }

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
