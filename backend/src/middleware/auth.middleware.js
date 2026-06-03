import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * 🔒 Route-Guard Authentication Gatekeeper Middleware
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "AUTHENTICATION_REQUIRED: Missing secure session token signature."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("🚨 [CRITICAL KERNEL ERROR]: JWT_SECRET environment configuration is unmapped!");
            return res.status(500).json({ success: false, error: "INTERNAL_SYSTEM_COMPILATION_ERROR" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch User and explicitly pull tokenVersion status to check expiration anomalies
        const currentUser = await User.findById(decoded.id).select('+tokenVersion +isActive');
        
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                error: "USER_NOT_FOUND: The user matching this token signature no longer exists."
            });
        }

        // Assert Account Suspension Flags
        if (!currentUser.isActive) {
            return res.status(403).json({
                success: false,
                error: "ACCOUNT_DEACTIVATED: Subsystem access privileges terminated."
            });
        }

        // Stateful Token Version Cross-Check
        if (decoded.tokenVersion !== currentUser.tokenVersion) {
            return res.status(401).json({
                success: false,
                error: "SESSION_INVALIDATED: Token signature revoked. Account logged out from another terminal device."
            });
        }

        req.user = currentUser;
        req.token = token;
        
        next();
    } catch (err) {
        console.error("⚠️ [AUTH_MIDDLEWARE_EXCEPTION]:", err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: "SESSION_EXPIRED: Authentication signature expired. Re-authenticate credentials."
            });
        }

        return res.status(401).json({
            success: false,
            error: "INVALID_TOKEN: Cryptographic authentication validation failure."
        });
    }
};

/**
 * ⚡ Token Minting Engine
 * Expects full user document object containing _id and tokenVersion properties
 */
export const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("🚨 JWT_SECRET environmental schema mappings are completely missing!");
    }

    if (!user || typeof user !== 'object') {
        throw new Error("🚨 [TOKEN GENERATION FAULT]: Expected a complete user document payload object.");
    }
    
    return jwt.sign(
        { 
            id: user._id, 
            tokenVersion: typeof user.tokenVersion === 'number' ? user.tokenVersion : 0
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );
};