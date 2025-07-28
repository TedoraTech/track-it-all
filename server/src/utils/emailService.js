const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Configure transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email configuration (e.g., SendGrid, AWS SES)
        this.transporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      } else {
        // Development configuration using Ethereal Email
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'ethereal.pass',
          },
        });
      }
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `"Student Hub" <${process.env.EMAIL_FROM || 'noreply@studenthub.com'}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
      }

      logger.info(`Email sent successfully to ${to}`);
      return result;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to Student Hub!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Student Hub</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #1976d2; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .welcome-text { color: #333; line-height: 1.6; margin-bottom: 20px; }
          .features { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { margin-bottom: 10px; }
          .cta-button { display: inline-block; background-color: #1976d2; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 Student Hub</div>
            <h1 style="color: #333; margin: 0;">Welcome to our community!</h1>
          </div>
          
          <div class="welcome-text">
            <p>Hello ${userName},</p>
            <p>Welcome to Student Hub! We're excited to have you join our vibrant community of students, scholars, and lifelong learners.</p>
          </div>

          <div class="features">
            <h3 style="color: #1976d2; margin-top: 0;">What you can do on Student Hub:</h3>
            <div class="feature-item">📝 <strong>Create and share posts</strong> with rich text editing and file uploads</div>
            <div class="feature-item">💬 <strong>Join study groups</strong> and connect with peers in your field</div>
            <div class="feature-item">🎯 <strong>Get answers</strong> to your academic questions from the community</div>
            <div class="feature-item">📊 <strong>Track your visa process</strong> with our analytics tools</div>
            <div class="feature-item">🔍 <strong>Discover resources</strong> tailored to your university and interests</div>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="cta-button">
              Start Exploring
            </a>
          </div>

          <div class="footer">
            <p>Need help getting started? Check out our <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/help" style="color: #1976d2;">help center</a> or reply to this email.</p>
            <p>Happy learning!<br>The Student Hub Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Student Hub Password';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #1976d2; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { color: #333; line-height: 1.6; }
          .reset-button { display: inline-block; background-color: #1976d2; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .security-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 Student Hub</div>
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your Student Hub account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset My Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
            
            <div class="security-notice">
              <strong>Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This link will expire in 1 hour for security purposes</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your current password will remain unchanged until you set a new one</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>If you're having trouble with the reset process, please contact our support team.</p>
            <p>Best regards,<br>The Student Hub Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendNotificationEmail(userEmail, userName, notification) {
    const subject = `New notification from Student Hub`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Notification</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #1976d2; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .notification { background-color: #e3f2fd; border-left: 4px solid #1976d2; padding: 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
          .view-button { display: inline-block; background-color: #1976d2; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 Student Hub</div>
            <h1 style="color: #333; margin: 0;">You have a new notification</h1>
          </div>
          
          <p>Hello ${userName},</p>
          
          <div class="notification">
            <h3 style="margin-top: 0; color: #1976d2;">${notification.title}</h3>
            <p style="margin-bottom: 0;">${notification.message}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/notifications" class="view-button">
              View All Notifications
            </a>
          </div>

          <div class="footer">
            <p>You can manage your notification preferences in your account settings.</p>
            <p>Best regards,<br>The Student Hub Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  htmlToText(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

module.exports = new EmailService();
