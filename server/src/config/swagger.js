const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Clean YAML-based Swagger Configuration
 * Loads documentation from separate YAML files for better maintainability
 */
class SwaggerConfig {
  constructor() {
    this.docsPath = path.join(__dirname, '../docs/api');
    this.spec = {
      openapi: '3.0.0',
      info: {
        title: 'Student Hub API',
        version: '1.0.0',
        description: 'A comprehensive API for student community platform with posts, chats, visa analytics, and more',
        contact: {
          name: 'Student Hub Team',
          email: 'support@studenthub.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production' 
            ? 'https://your-production-domain.com' 
            : 'http://localhost:5000',
          description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
        }
      ],
      paths: {},
      components: {}
    };
  }

  /**
   * Load and merge all YAML documentation files
   * @returns {Object} Complete Swagger spec
   */
  generateDocs() {
    console.log('📚 Loading YAML-based Swagger documentation...');
    
    try {
      // Load components (schemas, responses, etc.)
      this._loadComponents();
      
      // Load all API endpoint documentation
      this._loadApiDocumentation();
      
      console.log('✅ Swagger documentation loaded successfully');
      return this.spec;
    } catch (error) {
      console.error('❌ Error loading Swagger documentation:', error);
      throw error;
    }
  }

  /**
   * Load common components from components.yaml
   */
  _loadComponents() {
    const componentsFile = path.join(this.docsPath, 'components.yaml');
    if (fs.existsSync(componentsFile)) {
      const componentsContent = fs.readFileSync(componentsFile, 'utf8');
      const components = yaml.load(componentsContent);
      this.spec.components = { ...this.spec.components, ...components.components };
      console.log('📦 Loaded components from components.yaml');
    }
  }

  /**
   * Load all API documentation files
   */
  _loadApiDocumentation() {
    const apiFiles = [
      'auth.yaml',
      'posts.yaml', 
      'chats.yaml',
      'messages.yaml',
      'replies.yaml',
      'analytics.yaml'
    ];

    apiFiles.forEach(file => {
      const filePath = path.join(this.docsPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const apiDoc = yaml.load(content);
          
          if (apiDoc.paths) {
            this.spec.paths = { ...this.spec.paths, ...apiDoc.paths };
            console.log(`📄 Loaded paths from ${file}`);
          }
        } catch (error) {
          console.error(`❌ Error loading ${file}:`, error);
        }
      } else {
        console.warn(`⚠️  API documentation file not found: ${file}`);
      }
    });
  }

  /**
   * Setup Swagger UI middleware
   * @param {Object} app Express app instance
   */
  setupSwaggerUI(app) {
    const swaggerSpec = this.generateDocs();
    
    // Swagger UI options
    const options = {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .scheme-container { background: #fafafa; padding: 10px; border-radius: 4px; }
      `,
      customSiteTitle: 'Student Hub API Documentation'
    };

    // Serve Swagger documentation
    app.use('/api-docs', swaggerUi.serve);
    app.get('/api-docs', swaggerUi.setup(swaggerSpec, options));
    
    // Serve raw API spec
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    console.log(`📖 Swagger UI available at: http://localhost:${process.env.PORT || 5000}/api-docs`);
    console.log(`📋 API spec available at: http://localhost:${process.env.PORT || 5000}/api-docs.json`);
  }
}

module.exports = SwaggerConfig;
