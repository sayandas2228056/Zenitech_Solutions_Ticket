const nodemailer = require('nodemailer');
require('dotenv').config();

// Verify required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Email configuration is missing. Please check your .env file');
  process.exit(1);
}

console.log('📧 Email service configured for:', process.env.EMAIL_USER);
console.log('👤 Admin email set to:', process.env.ADMIN_EMAIL);

// Create a transporter with better configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.trim(), // Trim any accidental whitespace
  },
  tls: {
    rejectUnauthorized: false // Only for development, remove in production
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Error connecting to email server:', error);
  } else {
    console.log('✅ Server is ready to send emails');
  }
});

// Function to send email with screenshot
const sendScreenshotEmail = async (userEmail, userName, issueDescription, screenshot, customSubject = null) => {
  try {
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Send to admin email, fallback to sender
      subject: customSubject || `[Ticket] ${userName} - ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a56db; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">🎫 New Ticket Created</h2>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 5px 5px;">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">Ticket Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; width: 120px; color: #6b7280;">From:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>${userName} &lt;${userEmail}&gt;</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Subject:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${customSubject?.replace('New Ticket Created: ', '') || 'No Subject'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; vertical-align: top;">Description:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; white-space: pre-line;">${issueDescription || 'No description provided'}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1f2937;">📎 Attachment Details</h4>
              <p style="margin: 5px 0 0 0; color: #4b5563;">
                ${screenshot ? 
                  `• File: ${screenshot.originalname}<br>
                   • Type: ${screenshot.mimetype}<br>
                   • Size: ${(screenshot.size / 1024).toFixed(2)} KB` 
                  : 'No attachments'
                }
              </p>
              <p style="margin: 10px 0 0 0; color: #4b5563;">
                <strong>Ticket ID:</strong> ${customSubject?.match(/\[TKT-([^\]]+)\]/)?.[0] || 'N/A'}
              </p>
            </div>

            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
              <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
              <p style="margin: 5px 0;">Ticket ID: TKT-${Date.now().toString(36).toUpperCase()}</p>
            </div>
          </div>
        </div>
      `,
      attachments: screenshot ? [
        {
          filename: screenshot.originalname || `attachment-${Date.now()}`,
          content: screenshot.buffer,
          contentType: screenshot.mimetype || 'application/octet-stream',
        },
      ] : [],
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Screenshot submitted successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send screenshot');
  }
};

module.exports = { sendScreenshotEmail };
