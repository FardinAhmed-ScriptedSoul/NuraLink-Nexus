import crypto from 'crypto';
import User from '../models/User.js';
import { redis as redisClient } from '../config/redis.js';
import { generateToken } from '../middleware/auth.middleware.js';
import { 
    sendOtpEmail, 
    sendWelcomeEmail, 
    sendLoginAlertEmail, 
    sendLogoutAllWarningEmail 
} from '../services/email.services.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 Days
};

// Cryptographically secure database key namespaces for cluster state records
const CACHE_PREFIXES = {
    registration: 'auth:staging:',
    challenge: 'auth:challenge:'
};

// =================================================================
// 🔓 REGISTRATION HANDSHAKE LIFECYCLE (UPSTASH REDIS BACKED)
// =================================================================

/**
 * @action   POST /api/v1/auth/register-request
 * @desc     Initialize registration, parse layout fields, stage credentials in Redis, and emit a verification challenge key
 * @access   Public
 */
export const registerRequest = async (req, res, next) => {
    try {
        const { name, email, password, securityKeyphrase } = req.body;

        if (!name || !email || !password || !securityKeyphrase) {
            return res.status(400).json({
                success: false,
                error: "VALIDATION_FAILED: All boundary fields (name, email, password, securityKeyphrase) are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const accountExists = await User.findOne({ email: normalizedEmail });
        if (accountExists) {
            return res.status(409).json({
                success: false,
                error: "IDENTITY_CONFLICT: A profile matching this email address is already verified."
            });
        }

        // 🛡️ High-entropy secure verification passcode generation loop
        const verificationToken = crypto.randomInt(100000, 999999).toString();

        const stagingPayload = {
            name: name.trim(),
            password,
            securityKeyphrase: securityKeyphrase.trim(),
            verificationToken
        };

        const cacheKey = `${CACHE_PREFIXES.registration}${normalizedEmail}`;

        // 🧠 Atomic Upstash Write: Stash parameters in distributed cloud memory with explicit 10-minute TTL
        await redisClient.set(cacheKey, JSON.stringify(stagingPayload), { ex: 10 * 60 });

        // 📬 non-blocking async transactional mail notification pipeline trigger
        sendOtpEmail(normalizedEmail, verificationToken);

        return res.status(202).json({
            success: true,
            message: "CHALLENGE_STAGED: Registration verification token issued to system dispatch loop."
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @action   POST /api/v1/auth/register-verify
 * @desc     Validate verification tokens out of Redis, flush staging data cache records, and instantiate user documents
 * @access   Public
 */
export const registerVerify = async (req, res, next) => {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({
                success: false,
                error: "VALIDATION_FAILED: Target email pointer and token parameter are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const cacheKey = `${CACHE_PREFIXES.registration}${normalizedEmail}`;

        // Extract volatile unstructured session data tracking vector block
        const rawStagedRecord = await redisClient.get(cacheKey);

        if (!rawStagedRecord) {
            return res.status(410).json({
                success: false,
                error: "SESSION_EXPIRED: Registration session timeout or historical vector tracking expired."
            });
        }

        // Normalize string payload inputs dynamically out from client interfaces
        const stagedRecord = typeof rawStagedRecord === 'object' ? rawStagedRecord : JSON.parse(rawStagedRecord);

        if (stagedRecord.verificationToken !== token.trim()) {
            return res.status(400).json({
                success: false,
                error: "INVALID_TOKEN: Cryptographic authentication validation token mismatch."
            });
        }

        // Instantiate permanent user profile with verification flags explicitly enforced
        const newUser = await User.create({
            name: stagedRecord.name,
            email: normalizedEmail,
            password: stagedRecord.password,
            securityKeyphrase: stagedRecord.securityKeyphrase,
            isEmailVerified: true,
            isVocalAuthSetup: true,
            tokenVersion: 0
        });

        // Clear tracking cache vectors instantly upon verification completion to release allocation overhead
        await redisClient.del(cacheKey);

        // Fetch back full user object containing tokenVersion tracking states
        const freshUser = await User.findById(newUser._id).select('+tokenVersion');

        const sessionToken = generateToken(freshUser);
        res.cookie('token', sessionToken, COOKIE_OPTIONS);

        // 🎉 Non-blocking asynchronous deployment of profile onboarding greeting mail
        sendWelcomeEmail(freshUser.email, freshUser.name);

        return res.status(201).json({
            success: true,
            message: "VERIFIED: User record instantiated and session context opened cleanly.",
            user: {
                id: freshUser._id,
                name: freshUser.name,
                email: freshUser.email,
                avatarUrl: freshUser.avatarUrl
            }
        });
    } catch (err) {
        next(err);
    }
};

// =================================================================
// 🔓 MULTI-STAGE BIOMETRIC LOGIN PIPELINE (UPSTASH REDIS BACKED)
// =================================================================

/**
 * @action   POST /api/v1/auth/login-request
 * @desc     Verify base login profiles and stage a secure biometric challenge tracking key checkpoint inside Redis
 * @access   Public
 */
export const loginRequest = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "VALIDATION_FAILED: Email identifier and matching password fields are required."
            });
        }

        const targetUser = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +isActive +isEmailVerified');
        if (!targetUser) {
            return res.status(401).json({
                success: false,
                error: "INVALID_CREDENTIALS: Authentication handshake rejected."
            });
        }

        if (!targetUser.isActive) {
            return res.status(403).json({
                success: false,
                error: "ACCOUNT_DEACTIVATED: Subsystem access privileges terminated."
            });
        }

        if (!targetUser.isEmailVerified) {
            return res.status(403).json({
                success: false,
                error: "EMAIL_NOT_VERIFIED: Please verify your email channel architecture before establishing entry configurations."
            });
        }

        const isPasswordValid = await targetUser.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "INVALID_CREDENTIALS: Authentication handshake rejected."
            });
        }

        // High-entropy cryptographically secure hex buffer tracking challenge sequence keys
        const challengeId = crypto.randomBytes(16).toString('hex');
        const challengeKey = `${CACHE_PREFIXES.challenge}${challengeId}`;

        // Bind target user document object pointer to a strict 5-minute timeout window pattern inside cloud cache
        await redisClient.set(challengeKey, targetUser._id.toString(), { ex: 5 * 60 });

        return res.status(200).json({
            success: true,
            message: "CREDENTIALS_ACCEPTED: Account password matches standard credentials. Please speak your custom security keyphrase to authorize entry.",
            challengeId
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @action   POST /api/v1/auth/login-verify
 * @desc     Process incoming voice transcript strings, run cryptographic keyphrase validation, and issue security tokens
 * @access   Public
 */
export const loginVerify = async (req, res, next) => {
    try {
        const { challengeId, voiceTranscript } = req.body;

        if (!challengeId || !voiceTranscript) {
            return res.status(400).json({
                success: false,
                error: "VALIDATION_FAILED: Missing biometric token challenge tracking values or matching phrase inputs."
            });
        }

        const challengeKey = `${CACHE_PREFIXES.challenge}${challengeId}`;
        const cachedUserId = await redisClient.get(challengeKey);

        if (!cachedUserId) {
            return res.status(410).json({
                success: false,
                error: "CHALLENGE_TIMEOUT: The challenge token context has expired. Re-authenticate account credentials."
            });
        }

        const authenticatedUser = await User.findById(cachedUserId).select('+securityKeyphrase +tokenVersion +isActive');
        if (!authenticatedUser || !authenticatedUser.isActive) {
            return res.status(404).json({
                success: false,
                error: "USER_NOT_FOUND: Profile resolution failure or account access revoked."
            });
        }

        const sanitizedInput = voiceTranscript
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const isKeyphraseValid = await authenticatedUser.compareKeyphrase(sanitizedInput);

        if (!isKeyphraseValid) {
            return res.status(422).json({
                success: false,
                error: "BIOMETRIC_MISMATCH: Vocal transcription phrase validation failed against existing profile record hashes."
            });
        }

        // Flush challenge key state tracking logs cleanly out from Redis instantly upon validation match
        await redisClient.del(challengeKey);

        const sessionToken = generateToken(authenticatedUser);
        res.cookie('token', sessionToken, COOKIE_OPTIONS);

        // 🔑 Non-blocking alert warning email dispatcher triggering real-time activity metrics logs
        sendLoginAlertEmail(authenticatedUser.email);

        return res.status(200).json({
            success: true,
            message: "SUCCESS: Biometric verification sequence cleared. Security tokens issued.",
            user: {
                id: authenticatedUser._id,
                name: authenticatedUser.name,
                email: authenticatedUser.email,
                avatarUrl: authenticatedUser.avatarUrl
            }
        });
    } catch (err) {
        next(err);
    }
};

// =================================================================
// 🔐 PROTECTED SESSION LIFECYCLE CONTROLS
// =================================================================

/**
 * @action   POST /api/v1/auth/logout
 * @desc     Clear active session cookies and terminate local client context routes
 * @access   Private
 */
export const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        return res.status(200).json({
            success: true,
            message: "SUCCESS: Local secure session cleared cleanly from context."
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @action   POST /api/v1/auth/logout-all
 * @desc     Increment tokenVersion globally to forcefully invalidate all active device tokens platform-wide
 * @access   Private
 */
export const logoutAll = async (req, res, next) => {
    try {
        const freshUser = await User.findById(req.user._id).select('+tokenVersion');
        
        freshUser.tokenVersion = (freshUser.tokenVersion || 0) + 1;
        await freshUser.save();

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        // 🛑 Non-blocking dispatch warning email notification to indicate global device session evictions
        sendLogoutAllWarningEmail(freshUser.email);

        return res.status(200).json({
            success: true,
            message: "SUCCESS: System-wide master authorization purge complete across all terminal contexts."
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @action   GET /api/v1/auth/get-me
 * @desc     Return verified user profile details to reinitialize client dashboard state layouts on page reload
 * @access   Private
 */
export const getMe = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                avatarUrl: req.user.avatarUrl,
                isVocalAuthSetup: req.user.isVocalAuthSetup,
                createdAt: req.user.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
};

// =================================================================
// 🔄 PASSWORD RECOVERY & CREDENTIAL OVERRIDE INFRASTRUCTURE
// =================================================================

/**
 * @action   POST /api/v1/auth/forgot-password
 * @desc     Generate crypto token, hash record data parameters, and fire transaction email link
 * @access   Public
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "VALIDATION_FAILED: Email address parameter input fields are missing."
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // 🛡️ Safe tracking string responses implemented explicitly to mitigate target address gathering probes
        const staticMessage = "If an account exists with this email, a reset link has been sent.";
        
        if (!user) {
            return res.status(200).json({ success: true, message: staticMessage });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Resolve context tracking pointers out to user interface endpoints
        const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        // Pass out to your real-time Nodemailer transmission wrappers (Reuse sendOtpEmail signature as helper)
        await sendOtpEmail(user.email, resetURL);

        return res.status(200).json({ success: true, message: staticMessage });
    } catch (err) {
        next(err);
    }
};

/**
 * @action   PATCH /api/v1/auth/reset-password/:token
 * @desc     Validate inbound URL hash vectors, unpack expiration profiles, update password records
 * @access   Public
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        console.log("🔐 Reset attempt - token:", token);
        console.log("🔐 Token length:", token?.length);

        if (!token) {
            return res.status(400).json({
                success: false,
                error: "VALIDATION_FAILED: URL verification hash component missing."
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "VALIDATION_FAILED: Password must be at least 6 characters."
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        console.log("🔐 Hashed token:", hashedToken);

        // ✅ Use correct schema field names: resetPasswordToken, resetPasswordExpires
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        console.log("🔐 User found:", user ? "YES" : "NO");
        if (user) {
            console.log("🔐 Stored token hash:", user.resetPasswordToken);
            console.log("🔐 Expires at:", user.resetPasswordExpires);
        }

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                error: "INVALID_OR_EXPIRED: The verification hash string vector provided is invalid or has expired tracking parameters." 
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        
        await user.save();
        console.log("✅ Password reset successful for user:", user.email);

        return res.status(200).json({ 
            success: true, 
            message: "CREDENTIALS_RECONFIGURED: Password updated successfully." 
        });
    } catch (err) {
        console.error("❌ Reset password error:", err);
        next(err);
    }
};