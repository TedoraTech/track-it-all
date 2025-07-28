# Student Hub Backend

A comprehensive Node.js backend for the Student Hub application, providing RESTful APIs and real-time communication for student community features.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with refresh tokens
- **Post Management** - Create, read, update, delete posts with rich content
- **Real-time Chat System** - Group chats with Socket.io integration
- **File Upload System** - Support for local and AWS S3 storage
- **Visa Analytics** - Track visa application status and timeline
- **Community Features** - Voting, bookmarks, replies, and user interactions

### Technical Features
- **RESTful API Design** - Well-structured endpoints following REST principles
- **Real-time Communication** - Socket.io for instant messaging and notifications
- **Database Management** - PostgreSQL with Sequelize ORM
- **Caching Layer** - Redis for session management and performance
- **File Storage** - Flexible storage with local and cloud options
- **Security** - Rate limiting, input validation, and security middleware
- **Logging & Monitoring** - Comprehensive logging with Winston
- **Testing Ready** - Jest configuration for unit and integration tests

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer with AWS S3 support
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Documentation**: Built-in API documentation

## 📋 Prerequisites

Before running the application, ensure you have:

- Node.js 18.0.0 or higher
- PostgreSQL 12.0 or higher
- Redis 6.0 or higher
- npm or yarn package manager

## ⚡ Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd track-it-all/server

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_PREFIX=/api
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_hub_dev
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DIALECT=postgres

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@studenthub.com

# File Upload Configuration
USE_S3=false
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Development
SEED_DATABASE=true
```

### 3. Database Setup

```bash
# Create database
createdb student_hub_dev

# Run migrations (automatically done on first start in development)
npm run migrate

# Seed database with sample data (optional)
npm run seed
```

### 4. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will be available at `http://localhost:5000`

## 📚 API Documentation

Once the server is running, you can access:

- **API Documentation**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/health`
- **Server Info**: `http://localhost:5000/`

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Posts
- `GET /api/posts` - Get all posts (with filtering/pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/vote` - Vote on post
- `POST /api/posts/:id/bookmark` - Bookmark/unbookmark post

#### Replies
- `GET /api/posts/:postId/replies` - Get post replies
- `POST /api/posts/:postId/replies` - Create reply
- `PUT /api/posts/:postId/replies/:replyId` - Update reply
- `DELETE /api/posts/:postId/replies/:replyId` - Delete reply
- `POST /api/posts/:postId/replies/:replyId/vote` - Vote on reply
- `POST /api/posts/:postId/replies/:replyId/accept` - Accept as answer

#### Chats
- `GET /api/chats` - Get user's chats
- `GET /api/chats/discover` - Discover available chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details
- `POST /api/chats/:id/join` - Join chat
- `POST /api/chats/:id/leave` - Leave chat

#### Messages
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/messages` - Send message
- `PUT /api/chats/:chatId/messages/:messageId` - Edit message
- `DELETE /api/chats/:chatId/messages/:messageId` - Delete message
- `POST /api/chats/:chatId/messages/mark-read` - Mark messages as read

#### Visa Analytics
- `GET /api/analytics/visa` - Get visa analytics
- `GET /api/analytics/visa/cases` - Get user's visa cases
- `POST /api/analytics/visa/cases` - Create visa case
- `PUT /api/analytics/visa/cases/:id` - Update visa case
- `GET /api/analytics/visa/cases/:id/timeline` - Get case timeline
- `DELETE /api/analytics/visa/cases/:id` - Delete visa case

## 🔌 Real-time Features

The application supports real-time communication through Socket.io:

### Socket Events

#### Client to Server
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Send a message
- `edit-message` - Edit a message
- `delete-message` - Delete a message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator
- `mark-messages-read` - Mark messages as read
- `user-status-change` - Change user status

#### Server to Client
- `new-message` - New message received
- `message-edited` - Message was edited
- `message-deleted` - Message was deleted
- `user-joined-chat` - User joined chat
- `user-left-chat` - User left chat
- `user-typing-start` - User started typing
- `user-typing-stop` - User stopped typing
- `messages-read` - Messages marked as read
- `user-status-changed` - User status changed

### Socket Authentication

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database configuration
│   │   ├── logger.js     # Logging configuration
│   │   └── redis.js      # Redis configuration
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── errorHandler.js  # Error handling
│   │   ├── fileUpload.js # File upload handling
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── validation.js # Input validation
│   ├── models/           # Sequelize models
│   │   ├── index.js      # Model associations
│   │   ├── User.js       # User model
│   │   ├── Post.js       # Post model
│   │   ├── Chat.js       # Chat model
│   │   └── ...           # Other models
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── posts.js      # Post management
│   │   ├── chats.js      # Chat management
│   │   └── ...           # Other routes
│   ├── utils/            # Utility services
│   │   ├── emailService.js  # Email functionality
│   │   ├── fileService.js   # File operations
│   │   └── socketService.js # Socket.io management
│   ├── migrations/       # Database migrations
│   └── seeders/          # Database seeders
├── uploads/              # Local file storage
├── .env.example          # Environment template
├── package.json          # Dependencies
├── server.js             # Express app configuration
└── start.js              # Server startup script
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=auth

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Update `.env` for production
2. **Database**: Set up production PostgreSQL database
3. **Redis**: Configure production Redis instance
4. **File Storage**: Configure AWS S3 for file uploads
5. **Email Service**: Set up production email service
6. **SSL/TLS**: Configure HTTPS certificates
7. **Process Management**: Use PM2 or similar for process management

### Docker Deployment

```bash
# Build Docker image
docker build -t student-hub-backend .

# Run with Docker Compose
docker-compose up -d
```

### Environment-specific Commands

```bash
# Production
npm run start:prod

# Staging
npm run start:staging

# Run migrations in production
npm run migrate:prod

# Create production build
npm run build
```

## 🔧 Configuration

### Database Configuration

The application uses Sequelize ORM with PostgreSQL. Configuration is in `src/config/database.js`:

```javascript
module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  },
  // ... production config
};
```

### Redis Configuration

Redis is used for caching and session management:

```javascript
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};
```

### File Upload Configuration

Supports both local and AWS S3 storage:

```javascript
// Local storage
const localStorage = {
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, generateUniqueFileName(file));
  }
};

// S3 storage
const s3Storage = {
  s3: s3Instance,
  bucket: process.env.AWS_S3_BUCKET,
  key: (req, file, cb) => {
    cb(null, generateS3Key(file));
  }
};
```

## 🔐 Security

### Authentication & Authorization

- JWT-based authentication with access and refresh tokens
- Role-based access control (student, admin, moderator)
- Password hashing with bcrypt
- Secure token storage and validation

### API Security

- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- SQL injection prevention through ORM

### File Upload Security

- File type validation
- File size limits
- Virus scanning (configurable)
- Secure file naming
- Access control for uploaded files

## 📊 Monitoring & Logging

### Logging

Winston is used for comprehensive logging:

```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

### Health Monitoring

Health check endpoint provides system status:

```
GET /health
{
  "success": true,
  "message": "Student Hub API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](#-api-documentation)
2. Search existing [issues](../../issues)
3. Create a new [issue](../../issues/new) if needed
4. Contact the development team

## 🙏 Acknowledgments

- Express.js community for the excellent framework
- Sequelize team for the robust ORM
- Socket.io for real-time communication capabilities
- All contributors who have helped improve this project
