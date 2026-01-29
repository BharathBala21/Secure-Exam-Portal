const nodemailer = require('nodemailer');

/**
 * Send real emails using Gmail SMTP
 * Note: Requires Gmail App Password (Settings > Security > 2-Step Verification > App Passwords)
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Secure Exam Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`\x1b[32m[EMAIL DISPATCHED]\x1b[0m To: ${to} | Subject: ${subject}`);
        console.log(`\x1b[34m[CONTENT]:\x1b[0m ${text}`);
        return info;
    } catch (error) {
        console.error('CRITICAL: Email delivery failed:', error.message);
        // We log it but don't strictly crash the request, 
        // though in production you might want to throw an error.
        throw new Error('Email delivery failed. Please check SMTP configuration.');
    }
};

module.exports = sendEmail;
