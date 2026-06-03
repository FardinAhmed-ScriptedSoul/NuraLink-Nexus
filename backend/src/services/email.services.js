import transporter from '../config/mailer.js';
import config from '../config/config.js';

/**
 * Core Dynamic Blueprint Wrapper Engine
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `"NeuralCore Security" <${config.mail.user}>`,
            to,
            subject,
            html,
        };
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`🚨 [DISPATCH_FAILURE] Target: ${to} | Cause:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * 🛰️ Action 1: Dispatch One-Time Verification Passphrase
 */
export const sendOtpEmail = async (to, token) => {
    const html = `
        <div style="font-family: monospace; background-color: #05050a; color: #00f2ff; padding: 30px; border: 1px solid #00f2ff; border-radius: 8px;">
            <h2 style="color: #00f2ff; border-bottom: 2px dashed #00f2ff; padding-bottom: 10px;">⚡ SYSTEM ACCESS TOKENS DISPATCHED</h2>
            <p style="color: #a3e7fc;">An endpoint identity requested authorization credentials. Provide this high-entropy seed passphrase:</p>
            <div style="background-color: #0c1020; border: 1px solid #0055ff; padding: 15px; margin: 20px 0; text-align: center; border-radius: 4px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #fff;">${token}</span>
            </div>
            <p style="font-size: 11px; color: #527590;">This cryptographic broadcast is volatile and executes absolute local self-eviction within 10 minutes.</p>
        </div>
    `;
    return await sendEmail({ to, subject: '🔒 [NeuralCore] CHALLENGE_OTP_TOKEN Issued', html });
};

/**
 * 🎉 Action 2: Dispatch Profile Onboarding Welcome
 */
export const sendWelcomeEmail = async (to, name) => {
    const html = `
        <div style="font-family: monospace; background-color: #05050a; color: #00f2ff; padding: 30px; border: 1px solid #00f2ff; border-radius: 8px;">
            <h2 style="color: #00f2ff; border-bottom: 2px dashed #00f2ff; padding-bottom: 10px;">🌟 PROTOCOL_INITIALIZED: WELCOME TO NEURALCORE</h2>
            <p style="color: #a3e7fc;">Greetings <strong>${name}</strong>,</p>
            <p style="color: #a3e7fc;">Your profile node signature has successfully bound onto the central server database context. Multi-stage vocal auth configurations are now live.</p>
            <div style="margin-top: 30px; font-size: 12px; color: #527590; border-top: 1px solid #003366; pt: 10px;">
                System Level: Active Node | Environment: Secured Matrix
            </div>
        </div>
    `;
    return await sendEmail({ to, subject: '🚀 [NeuralCore] IDENTITY_BOUND: Registration Successful', html });
};

/**
 * ⚡ Action 3: New Active Device Entry Alert Notice
 */
export const sendLoginAlertEmail = async (to, metadata = {}) => {
    const time = new Date().toISOString();
    const html = `
        <div style="font-family: monospace; background-color: #05050a; color: #ffaa00; padding: 30px; border: 1px solid #ffaa00; border-radius: 8px;">
            <h2 style="color: #ffaa00; border-bottom: 2px dashed #ffaa00; padding-bottom: 10px;">⚠️ AUTHENTICATION ACCESS EVENT NOTICE</h2>
            <p style="color: #ffcc66;">A successful login sequence was authorized for your user profile configuration array.</p>
            <div style="background-color: #110e05; border: 1px solid #ffaa00; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px;">
                <b style="color: #ffaa00;">TIMESTAMP:</b> ${time}<br>
                <b style="color: #ffaa00;">STATUS:</b> Token Validation & Vocal Handshake Cleared
            </div>
            <p style="font-size: 11px; color: #997a3d;">If this synchronization loop was unintended, run the emergency purge route /logout-all instantly.</p>
        </div>
    `;
    return await sendEmail({ to, subject: '🔑 [NeuralCore] SECURITY: New Access Login Logged', html });
};

/**
 * 🚨 Action 4: Master Invalidation Security Purge Warning Acknowledgement
 */
export const sendLogoutAllWarningEmail = async (to) => {
    const html = `
        <div style="font-family: monospace; background-color: #0a0505; color: #ff0055; padding: 30px; border: 1px solid #ff0055; border-radius: 8px;">
            <h2 style="color: #ff0055; border-bottom: 2px dashed #ff0055; padding-bottom: 10px;">🚨 SYSTEM OVERRIDE: SESSION PURGE EXECUTED</h2>
            <p style="color: #ff99aa;">A master execution command was received by the server cluster mapping your email vector.</p>
            <div style="background-color: #1a050b; border: 1px solid #ff0055; padding: 15px; margin: 20px 0; text-align: center; border-radius: 4px;">
                <span style="font-size: 18px; font-weight: bold; color: #fff;">ALL CORES DETACHED & REVOKED</span>
            </div>
            <p style="color: #ff99aa;">Every existing cookie context, active JSON Web Token version, and validation session has been force-evicted from global storage keys.</p>
        </div>
    `;
    return await sendEmail({ to, subject: '🛑 [NeuralCore] ATTENTION: Global Session Terminated', html });
};