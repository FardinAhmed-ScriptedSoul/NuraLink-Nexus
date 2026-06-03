import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { 
    registerRequest, 
    registerVerify, 
    loginRequest, 
    loginVerify, 
    logout, 
    logoutAll, 
    getMe,
    forgotPassword,
    resetPassword
} from '../controllers/auth.controller.js';

const router = express.Router();

// =================================================================
// 🔓 PUBLIC IDENTITY REGISTRATION & HANDSHAKE PIPELINE
// =================================================================

/**
 * @route   POST /api/v1/auth/register-request
 * @desc    Initialize registration, validate user boundaries, stage challenge
 * @access  Public (Rate-Limited via Upstash Redis)
 */
router.post('/register-request', authRateLimiter, registerRequest);

/**
 * @route   POST /api/v1/auth/register-verify
 * @desc    Validate verification challenge parameters and instantiate User document
 * @access  Public (Rate-Limited via Upstash Redis)
 */
router.post('/register-verify', authRateLimiter, registerVerify);

// =================================================================
// 🔓 PUBLIC AUTHENTICATION & MULTI-STAGE VOICE VERIFICATION
// =================================================================

/**
 * @route   POST /api/v1/auth/login-request
 * @desc    Validate email/password, extract user and prepare vocal/handshake challenge
 * @access  Public (Rate-Limited via Upstash Redis)
 */
router.post('/login-request', authRateLimiter, loginRequest);

/**
 * @route   POST /api/v1/auth/login-verify
 * @desc    Process vocal phrase text matching strings to lock session and mint HttpOnly JWTs
 * @access  Public (Rate-Limited via Upstash Redis)
 */
router.post('/login-verify', authRateLimiter, loginVerify);

// =================================================================
// 🔄 PUBLIC PASSWORD RECOVERY & CREDENTIAL RESET INFRASTRUCTURE
// =================================================================

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Generate crypto token, hash record data parameters, and fire transaction email link
 * @access  Public (Rate-Limited via Upstash Redis)
 */
router.post('/forgot-password', authRateLimiter, forgotPassword);

/**
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @desc    Validate inbound URL hash vectors, unpack expiration profiles, update password records
 * @access  Public
 */
router.patch('/reset-password/:token', resetPassword);

// =================================================================
// 🔐 PROTECTED SESSION LIFECYCLE MANAGEMENT (Locked with Protect Gate)
// =================================================================

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate current session access and clear client cookie contexts
 * @access  Private (Requires valid JWT check)
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Purge entire active user session array to log out all terminal devices
 * @access  Private (Requires valid JWT check)
 */
router.post('/logout-all', protect, logoutAll);

/**
 * @route   GET /api/v1/auth/get-me
 * @desc    Retrieve core active profile context for client-side state initialization
 * @access  Private (Requires valid JWT check)
 */
router.get('/get-me', protect, getMe);

export default router;