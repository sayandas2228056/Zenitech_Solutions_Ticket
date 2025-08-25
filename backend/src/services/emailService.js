const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});

const sendTicketConfirmation = async (ticket) => {
    try {
        const mailOptions = {
            from: `"Support System" <${config.EMAIL_USER}>`,
            to: ticket.email, // Customer's email
            cc: 'sayandas010124@gmail.com', // Your email as CC
            subject: `[Ticket #${ticket.token}] Support Ticket Created`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Support Ticket Created Successfully</h2>
                    <p>Hello ${ticket.name},</p>
                    <p>Thank you for reaching out to our support team. We've received your request and a ticket has been created.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1f2937;">Ticket Details</h3>
                        <p><strong>Ticket #:</strong> ${ticket.token}</p>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                        <p><strong>Status:</strong> <span style="color: #059669; font-weight: 500;">${ticket.status || 'Open'}</span></p>
                        <p><strong>Date Created:</strong> ${new Date().toLocaleString()}</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <p><strong>Description:</strong></p>
                        <p style="background-color: #f9fafb; padding: 10px; border-left: 3px solid #3b82f6; font-style: italic;">
                            ${ticket.description}
                        </p>
                    </div>

                    <p style="margin-top: 25px;">
                        Our team will review your request and get back to you as soon as possible. 
                        You can track the status of your ticket using the ticket number mentioned above.
                    </p>

                    <p>Best regards,<br>Support Team</p>
                    
                    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                        <p>This is an automated message, please do not reply directly to this email.</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent for ticket #${ticket.token}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        // Don't throw the error to prevent ticket creation from failing
    }
};

module.exports = {
    sendTicketConfirmation,
};
