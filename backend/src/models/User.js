import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "NAME_REQUIRED_FIELD"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "EMAIL_REQUIRED_FIELD"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'INVALID_EMAIL_FORMAT']
    },
    password: {
        type: String,
        required: [true, "PASSWORD_REQUIRED_FIELD"],
        select: false // Excluded from generic queries for maximum safety
    },
    
    // =================================================================
    // 🔐 BIOMETRIC & VOCAL PASSPHRASE KEY SYSTEM
    // =================================================================
    securityKeyphrase: {
        type: String,
        required: [true, "VOCAL_KEYPHRASE_REQUIRED_FIELD"],
        select: false // Prevents leakage during generic API user payload fetches
    },
    isVocalAuthSetup: {
        type: Boolean,
        default: false
    },

    // =================================================================
    // ✉️ EMAIL VERIFICATION SYSTEM
    // =================================================================
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationExpires: {
        type: Date,
        select: false
    },

    // =================================================================
    // 🔄 PASSWORD RESET INFRASTRUCTURE
    // =================================================================
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    },

    // =================================================================
    // 🛰️ SECURITY CONTROL & ACCOUNT STATUS
    // =================================================================
    tokenVersion: {
        type: Number,
        default: 0,
        select: false // Prevents the raw version tracking identifier from leaking to clients
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // =================================================================
    // 🎨 CYBERNETIC ASSISTANT AGENT CONFIG
    // =================================================================
    avatarUrl: {
        type: String,
        default: "/public/presets/brain_grid.png"
    },
    avatarType: {
        type: String,
        enum: ['PRESET_FRAME', 'LOCAL_UPLOAD'],
        default: 'PRESET_FRAME'
    },
    assistant: {
        name: {
            type: String,
            default: "NEURAL_CORE_AI"
        },
        voiceProfile: {
            type: String,
            default: "AURA_NEURAL_S01"
        }
    },

    // =================================================================
    // 🛡️ GRANULAR SUBSYSTEM ACCESS PRIVILEGES MATRIX
    // =================================================================
    permissions: {
        serverControl: {
            type: Boolean,
            default: false // Authorize Server Control Subsystems
        },
        sandboxEngine: {
            type: Boolean,
            default: false // Sandbox Engine Control Array
        },
        ecosystemLink: {
            type: Boolean,
            default: false // Ecosystem Core Command Link
        }
    },

    // =================================================================
    // 🔗 CROSS-COLLECTION OPTIMIZATION LINKS
    // =================================================================
    interviewReports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
    }],
    ownedServers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server'
    }],
    joinedServers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server'
    }],

    // =================================================================
    // 📈 HISTORICAL MONITOR TIMING
    // =================================================================
    lastSystemAccess: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// =================================================================
// 🛡️ DOCUMENT PRE-SAVE INTERCEPTOR LIFECYCLE (AUTOMATED HASHING)
// =================================================================
userSchema.pre('save', async function () {
    // 1. Process password changes
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            throw new Error(`[PASSWORD_HASHING_FAILED]: ${error.message}`);
        }
    }

    // 2. Normalize and Process biometric vocal keyphrase changes
    if (this.isModified('securityKeyphrase')) {
        try {
            // 🧹 SANITATION: Lowercase, remove all whitespace, strip out special characters
            const normalizedKeyphrase = this.securityKeyphrase
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');

            const salt = await bcrypt.genSalt(12);
            this.securityKeyphrase = await bcrypt.hash(normalizedKeyphrase, salt);
            this.isVocalAuthSetup = true; 
        } catch (error) {
            throw new Error(`[KEYPHRASE_HASHING_FAILED]: ${error.message}`);
        }
    }
});
// =================================================================
// 🔑 MODEL SCHEMA INSTANCE METHODS
// =================================================================
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareKeyphrase = async function (candidateKeyphrase) {
    return await bcrypt.compare(candidateKeyphrase, this.securityKeyphrase);
};

// Add these fields to your userSchema definition:
// passwordResetToken: { type: String, select: false },
// passwordResetExpires: { type: Date, select: false },

// Add this instance method to the userSchema:
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // ✅ Use the correct schema field names (all lowercase 'reset')
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;