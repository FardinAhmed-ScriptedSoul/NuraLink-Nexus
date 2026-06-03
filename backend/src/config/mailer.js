import nodemailer from 'nodemailer';
import config from './config.js'; // Points to your updated config file

/**
 * 🔒 Authenticated Node-Mailer SMTP Core Pool
 * Uses secure Google OAuth2 flow to handle session handshakes
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.mail.user,
        clientId: config.mail.clientId,
        clientSecret: config.mail.clientSecret,
        refreshToken: config.mail.refreshToken,
    },
});

// Verify the mail channel integrity on server spin-up
transporter.verify((error, success) => {
    if (error) {
        console.error("🚨 [MAIL DEPLOYMENT ERROR]: SMTP Handshake handshake failed:", error.message);
    } else {
        console.log("📬 [MAIL SYSTEM]: Secured Google OAuth2 SMTP transporter ready for dispatch loops.");
    }
});

export default transporter;