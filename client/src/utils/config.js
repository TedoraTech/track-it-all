// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // Posts
  POSTS: `${API_BASE_URL}/posts`,
  POST_BY_ID: (id) => `${API_BASE_URL}/posts/${id}`,
  UPVOTE_POST: (id) => `${API_BASE_URL}/posts/${id}/upvote`,
  POST_REPLIES: (id) => `${API_BASE_URL}/posts/${id}/replies`,
  VOTE_REPLY: (replyId) => `${API_BASE_URL}/replies/${replyId}/vote`,
  
  // Chats
  CHATS: `${API_BASE_URL}/chats`,
  DISCOVER_CHATS: `${API_BASE_URL}/chats/discover`,
  CHAT_MESSAGES: (id) => `${API_BASE_URL}/chats/${id}/messages`,
  JOIN_CHAT: (id) => `${API_BASE_URL}/chats/${id}/join`,
  LEAVE_CHAT: (id) => `${API_BASE_URL}/chats/${id}/leave`,
  
  // Analytics
  VISA_ANALYTICS: `${API_BASE_URL}/analytics/visa`,
};

export const APP_CONFIG = {
  APP_NAME: 'Student Hub',
  VERSION: '1.1',
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

export default {
  API_ENDPOINTS,
  APP_CONFIG,
};
