const express = require('express');
const path = require('path');
const fs = require('fs');

/**
 * Utility to automatically discover and document all Express routes
 * This creates comprehensive Swagger documentation for all endpoints
 */
class RouteDiscovery {
  constructor(app) {
    this.app = app;
    this.routes = [];
    this.basePaths = new Set();
  }

  /**
   * Discover all routes from Express app
   * @returns {Array} Array of route information
   */
  discoverRoutes() {
    this.routes = [];
    this.basePaths.clear();
    
    // Get all routes from the Express app
    this._extractRoutes(this.app._router);
    
    return {
      routes: this.routes,
      summary: this._generateSummary(),
      basePaths: Array.from(this.basePaths)
    };
  }

  /**
   * Extract routes from Express router recursively
   * @param {Object} router Express router instance
   * @param {String} basePath Base path for nested routers
   */
  _extractRoutes(router, basePath = '') {
    if (!router || !router.stack) return;

    router.stack.forEach(layer => {
      if (layer.route) {
        // Direct route
        const route = layer.route;
        const methods = Object.keys(route.methods).filter(method => method !== '_all');
        
        methods.forEach(method => {
          const fullPath = basePath + route.path;
          this.routes.push({
            method: method.toUpperCase(),
            path: fullPath,
            originalPath: route.path,
            basePath: basePath,
            middlewares: this._getMiddlewareNames(route.stack),
            params: this._extractParams(fullPath),
            category: this._categorizeRoute(fullPath)
          });
          this.basePaths.add(basePath);
        });
      } else if (layer.name === 'router') {
        // Nested router
        const nestedBasePath = basePath + (layer.regexp.source.match(/^\^\\?(.*?)\\\?\?\(\?\=/) || ['', ''])[1].replace(/\\\//g, '/');
        this._extractRoutes(layer.handle, nestedBasePath);
      }
    });
  }

  /**
   * Get middleware names from route stack
   * @param {Array} stack Route middleware stack
   * @returns {Array} Array of middleware names
   */
  _getMiddlewareNames(stack) {
    return stack.map(layer => {
      if (layer.name && layer.name !== 'anonymous') {
        return layer.name;
      } else if (layer.handle && layer.handle.name) {
        return layer.handle.name;
      }
      return 'anonymous';
    }).filter(name => name !== 'anonymous');
  }

  /**
   * Extract parameters from route path
   * @param {String} path Route path
   * @returns {Array} Array of parameter names
   */
  _extractParams(path) {
    const matches = path.match(/:([^/]+)/g);
    return matches ? matches.map(match => match.substring(1)) : [];
  }

  /**
   * Categorize route based on path
   * @param {String} path Route path
   * @returns {String} Route category
   */
  _categorizeRoute(path) {
    if (path.includes('/auth')) return 'Authentication';
    if (path.includes('/posts') && path.includes('/replies')) return 'Replies';
    if (path.includes('/posts')) return 'Posts';
    if (path.includes('/chats') && path.includes('/messages')) return 'Messages';
    if (path.includes('/chats')) return 'Chats';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/upload')) return 'File Upload';
    return 'General';
  }

  /**
   * Generate summary of discovered routes
   * @returns {Object} Route summary
   */
  _generateSummary() {
    const categories = {};
    const methods = {};
    
    this.routes.forEach(route => {
      // Count by category
      if (!categories[route.category]) {
        categories[route.category] = 0;
      }
      categories[route.category]++;
      
      // Count by method
      if (!methods[route.method]) {
        methods[route.method] = 0;
      }
      methods[route.method]++;
    });

    return {
      totalRoutes: this.routes.length,
      categories,
      methods,
      uniqueBasePaths: this.basePaths.size
    };
  }

  /**
   * Generate Swagger paths object for all discovered routes
   * @returns {Object} Swagger paths object
   */
  generateSwaggerPaths() {
    const paths = {};

    this.routes.forEach(route => {
      const path = route.path.replace(/:([^/]+)/g, '{$1}'); // Convert :id to {id}
      
      if (!paths[path]) {
        paths[path] = {};
      }

      paths[path][route.method.toLowerCase()] = {
        tags: [route.category],
        summary: this._generateRouteSummary(route),
        description: this._generateDescription(route),
        parameters: this._generateParameters(route),
        responses: this._generateResponses(route),
        security: this._requiresAuth(route) ? [{ bearerAuth: [] }] : undefined
      };

      // Add request body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
        paths[path][route.method.toLowerCase()].requestBody = this._generateRequestBody(route);
      }
    });

    return paths;
  }

  /**
   * Generate summary for a route
   * @param {Object} route Route object
   * @returns {String} Route summary
   */
  _generateRouteSummary(route) {
    const action = this._getActionFromMethod(route.method);
    const resource = this._getResourceFromPath(route.path);
    return `${action} ${resource}`;
  }

  /**
   * Generate description for a route
   * @param {Object} route Route object
   * @returns {String} Route description
   */
  _generateDescription(route) {
    const descriptions = {
      'GET /api/auth/me': 'Get current authenticated user profile',
      'POST /api/auth/register': 'Register a new user account',
      'POST /api/auth/login': 'Login user with email and password',
      'POST /api/auth/logout': 'Logout user and invalidate tokens',
      'GET /api/posts': 'Get all posts with filtering and pagination',
      'POST /api/posts': 'Create new post with optional attachments',
      'GET /api/posts/:id': 'Get single post by ID with full details',
      'PUT /api/posts/:id': 'Update post (author/admin only)',
      'DELETE /api/posts/:id': 'Soft delete post (author/admin only)',
      'POST /api/posts/:id/vote': 'Vote on post (upvote/downvote)',
      'POST /api/posts/:id/bookmark': 'Toggle bookmark status for post',
      'GET /api/chats': 'Get user\'s joined chats',
      'POST /api/chats': 'Create new chat room',
      'GET /api/chats/discover': 'Discover public chats to join',
      'POST /api/chats/:id/join': 'Join a chat room',
      'POST /api/chats/:id/leave': 'Leave a chat room'
    };

    const key = `${route.method} ${route.path}`;
    return descriptions[key] || `${this._getActionFromMethod(route.method)} ${this._getResourceFromPath(route.path)}`;
  }

  /**
   * Generate parameters for a route
   * @param {Object} route Route object
   * @returns {Array} Parameters array
   */
  _generateParameters(route) {
    const parameters = [];

    // Path parameters
    route.params.forEach(param => {
      parameters.push({
        in: 'path',
        name: param,
        required: true,
        schema: { type: 'string' },
        description: `${param.charAt(0).toUpperCase() + param.slice(1)} identifier`
      });
    });

    // Query parameters for GET requests
    if (route.method === 'GET') {
      if (route.path.includes('/posts') && !route.path.includes('/:')) {
        parameters.push(
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 }},
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 }},
          { in: 'query', name: 'category', schema: { type: 'string' }},
          { in: 'query', name: 'tags', schema: { type: 'string' }},
          { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Search query' }
        );
      } else if (route.path.includes('/chats') && !route.path.includes('/:')) {
        parameters.push(
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 }},
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 }}
        );
      } else if (route.path.includes('/messages')) {
        parameters.push(
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 }},
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 }},
          { in: 'query', name: 'before', schema: { type: 'string' }, description: 'Get messages before this timestamp' }
        );
      }
    }

    return parameters.length > 0 ? parameters : undefined;
  }

  /**
   * Generate request body for a route
   * @param {Object} route Route object
   * @returns {Object} Request body object
   */
  _generateRequestBody(route) {
    const schemas = {
      'POST /api/auth/register': 'UserRegistration',
      'POST /api/auth/login': 'UserLogin',
      'POST /api/posts': 'PostCreate',
      'PUT /api/posts/:id': 'PostUpdate',
      'POST /api/posts/:id/vote': 'VoteRequest',
      'POST /api/chats': 'ChatCreate',
      'POST /api/chats/:chatId/messages': 'MessageCreate',
      'PUT /api/chats/:chatId/messages/:messageId': 'MessageUpdate'
    };

    const key = `${route.method} ${route.path}`;
    const schemaName = schemas[key];

    if (schemaName) {
      return {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${schemaName}` }
          }
        }
      };
    }

    // Generic request body
    return {
      required: true,
      content: {
        'application/json': {
          schema: { type: 'object' }
        }
      }
    };
  }

  /**
   * Generate responses for a route
   * @param {Object} route Route object
   * @returns {Object} Responses object
   */
  _generateResponses(route) {
    const responses = {
      200: { description: 'Success' },
      400: { $ref: '#/components/responses/ValidationError' },
      500: { $ref: '#/components/responses/InternalServerError' }
    };

    if (this._requiresAuth(route)) {
      responses[401] = { $ref: '#/components/responses/UnauthorizedError' };
    }

    if (route.method === 'POST') {
      responses[201] = { description: 'Created successfully' };
      delete responses[200];
    }

    if (route.path.includes('/:')) {
      responses[404] = { $ref: '#/components/responses/NotFoundError' };
    }

    return responses;
  }

  /**
   * Check if route requires authentication
   * @param {Object} route Route object
   * @returns {Boolean} True if requires auth
   */
  _requiresAuth(route) {
    const publicRoutes = [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'POST /api/auth/reset-password'
    ];

    const key = `${route.method} ${route.path}`;
    return !publicRoutes.includes(key);
  }

  /**
   * Get action from HTTP method
   * @param {String} method HTTP method
   * @returns {String} Action description
   */
  _getActionFromMethod(method) {
    const actions = {
      GET: 'Get',
      POST: 'Create',
      PUT: 'Update',
      PATCH: 'Update',
      DELETE: 'Delete'
    };
    return actions[method] || 'Process';
  }

  /**
   * Get resource from path
   * @param {String} path Route path
   * @returns {String} Resource description
   */
  _getResourceFromPath(path) {
    if (path.includes('/auth')) return 'authentication';
    if (path.includes('/posts') && path.includes('/replies')) return 'reply';
    if (path.includes('/posts') && path.includes('/vote')) return 'post vote';
    if (path.includes('/posts') && path.includes('/bookmark')) return 'post bookmark';
    if (path.includes('/posts')) return 'post';
    if (path.includes('/chats') && path.includes('/messages')) return 'message';
    if (path.includes('/chats') && path.includes('/join')) return 'chat membership';
    if (path.includes('/chats') && path.includes('/discover')) return 'public chats';
    if (path.includes('/chats')) return 'chat';
    if (path.includes('/analytics')) return 'analytics';
    return 'resource';
  }

  /**
   * Print route discovery report
   */
  printReport() {
    const discovery = this.discoverRoutes();
    
    console.log('\n🔍 Route Discovery Report');
    console.log('=========================');
    console.log(`📊 Total Routes: ${discovery.summary.totalRoutes}`);
    console.log(`📂 Categories: ${Object.keys(discovery.summary.categories).length}`);
    console.log(`🛤️  Base Paths: ${discovery.summary.uniqueBasePaths}`);
    
    console.log('\n📋 Routes by Category:');
    Object.entries(discovery.summary.categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} routes`);
    });
    
    console.log('\n🔧 Routes by Method:');
    Object.entries(discovery.summary.methods).forEach(([method, count]) => {
      console.log(`  ${method}: ${count} routes`);
    });
    
    console.log('\n📍 All Discovered Routes:');
    discovery.routes.forEach(route => {
      console.log(`  ${route.method.padEnd(6)} ${route.path.padEnd(40)} [${route.category}]`);
    });
    
    return discovery;
  }
}

module.exports = RouteDiscovery;
