#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to remove all Swagger comments from route files
 * This will clean up the inline documentation and make files more readable
 */

const routesDir = '/Users/thrupthin/Desktop/track-it-all/server/src/routes';
const routeFiles = [
  'posts.js',
  'chats.js', 
  'messages.js',
  'replies.js',
  'analytics.js'
];

function removeSwaggerComments(content) {
  // Remove multi-line swagger comments (/** @swagger ... */)
  content = content.replace(/\/\*\*\s*\*\s*@swagger[\s\S]*?\*\//g, '');
  
  // Remove single line swagger comments
  content = content.replace(/\s*\*\s*@swagger.*/g, '');
  
  // Clean up extra empty lines (more than 2 consecutive)
  content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  return content;
}

console.log('🧹 Cleaning up Swagger comments from route files...\n');

routeFiles.forEach(fileName => {
  const filePath = path.join(routesDir, fileName);
  
  if (fs.existsSync(filePath)) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const cleanedContent = removeSwaggerComments(originalContent);
      
      // Only write if content changed
      if (originalContent !== cleanedContent) {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        
        const originalLines = originalContent.split('\n').length;
        const cleanedLines = cleanedContent.split('\n').length;
        const removedLines = originalLines - cleanedLines;
        
        console.log(`✅ ${fileName}: Removed ${removedLines} lines of Swagger comments`);
      } else {
        console.log(`✨ ${fileName}: Already clean (no Swagger comments found)`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
    }
  } else {
    console.warn(`⚠️  File not found: ${fileName}`);
  }
});

console.log('\n🎉 Route file cleanup completed!');
console.log('📝 All route files now contain only clean business logic');
console.log('📚 Documentation is now maintained in separate YAML files');
