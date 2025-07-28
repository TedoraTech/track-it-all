const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('../config/logger');

class FileService {
  constructor() {
    this.s3 = null;
    this.useS3 = process.env.USE_S3 === 'true';
    this.localUploadsPath = path.join(__dirname, '../../uploads');
    
    if (this.useS3) {
      this.initializeS3();
    }
  }

  initializeS3() {
    try {
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      });

      this.s3 = new AWS.S3();
      this.bucketName = process.env.AWS_S3_BUCKET;

      if (!this.bucketName) {
        throw new Error('AWS_S3_BUCKET environment variable is required when using S3');
      }

      logger.info('S3 client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize S3 client:', error);
      this.useS3 = false;
    }
  }

  generateFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const name = path.basename(originalName, extension).toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    return `${prefix}${timestamp}_${randomId}_${name}${extension}`;
  }

  async uploadFile(file, folder = 'general', userId = null) {
    try {
      const fileName = this.generateFileName(file.originalname, userId ? `${userId}_` : '');
      const filePath = `${folder}/${fileName}`;

      if (this.useS3) {
        return await this.uploadToS3(file, filePath);
      } else {
        return await this.uploadToLocal(file, folder, fileName);
      }
    } catch (error) {
      logger.error('File upload failed:', error);
      throw error;
    }
  }

  async uploadToS3(file, filePath) {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    };

    const result = await this.s3.upload(uploadParams).promise();
    
    return {
      fileName: path.basename(filePath),
      originalName: file.originalname,
      filePath: filePath,
      url: result.Location,
      size: file.size,
      mimeType: file.mimetype,
      storage: 's3',
    };
  }

  async uploadToLocal(file, folder, fileName) {
    const folderPath = path.join(this.localUploadsPath, folder);
    
    // Ensure directory exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fullPath = path.join(folderPath, fileName);
    
    // Write file to disk
    fs.writeFileSync(fullPath, file.buffer);

    const relativePath = `${folder}/${fileName}`;
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    return {
      fileName,
      originalName: file.originalname,
      filePath: relativePath,
      url: `${baseUrl}/uploads/${relativePath}`,
      size: file.size,
      mimeType: file.mimetype,
      storage: 'local',
    };
  }

  async deleteFile(filePath) {
    try {
      if (this.useS3) {
        await this.deleteFromS3(filePath);
      } else {
        await this.deleteFromLocal(filePath);
      }
      logger.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to delete file ${filePath}:`, error);
      throw error;
    }
  }

  async deleteFromS3(filePath) {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: filePath,
    };

    await this.s3.deleteObject(deleteParams).promise();
  }

  async deleteFromLocal(filePath) {
    const fullPath = path.join(this.localUploadsPath, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async getFileInfo(filePath) {
    try {
      if (this.useS3) {
        return await this.getS3FileInfo(filePath);
      } else {
        return await this.getLocalFileInfo(filePath);
      }
    } catch (error) {
      logger.error(`Failed to get file info for ${filePath}:`, error);
      throw error;
    }
  }

  async getS3FileInfo(filePath) {
    const params = {
      Bucket: this.bucketName,
      Key: filePath,
    };

    const result = await this.s3.headObject(params).promise();
    
    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
      metadata: result.Metadata,
    };
  }

  async getLocalFileInfo(filePath) {
    const fullPath = path.join(this.localUploadsPath, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }

    const stats = fs.statSync(fullPath);
    
    return {
      size: stats.size,
      lastModified: stats.mtime,
      contentType: this.getMimeType(path.extname(filePath)),
    };
  }

  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'],
    } = options;

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check MIME type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    // Check file extension
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`File extension ${extension} is not allowed`);
    }

    return true;
  }

  async uploadMultipleFiles(files, folder = 'general', userId = null) {
    const uploadPromises = files.map(file => this.uploadFile(file, folder, userId));
    return await Promise.all(uploadPromises);
  }

  getFileUrl(filePath) {
    if (this.useS3) {
      return `https://${this.bucketName}.s3.amazonaws.com/${filePath}`;
    } else {
      const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
      return `${baseUrl}/uploads/${filePath}`;
    }
  }

  async generateSignedUrl(filePath, expiresIn = 3600) {
    if (!this.useS3) {
      // For local files, return the regular URL
      return this.getFileUrl(filePath);
    }

    const params = {
      Bucket: this.bucketName,
      Key: filePath,
      Expires: expiresIn,
    };

    return await this.s3.getSignedUrlPromise('getObject', params);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(mimeType) {
    return mimeType.startsWith('image/');
  }

  isVideoFile(mimeType) {
    return mimeType.startsWith('video/');
  }

  isAudioFile(mimeType) {
    return mimeType.startsWith('audio/');
  }

  isDocumentFile(mimeType) {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ];
    
    return documentTypes.includes(mimeType);
  }
}

module.exports = new FileService();
