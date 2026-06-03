import mongoose from 'mongoose';
import crypto from 'crypto';

// =================================================================
// 📻 EMBEDDED CHANNEL SUBSCHEMA
// =================================================================
const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "CHANNEL_NAME_REQUIRED"],
        trim: true,
        lowercase: true
    },
    type: {
        type: String,
        enum: ['TEXT', 'VOICE_MESH'],
        default: 'TEXT' // VOICE_MESH handles real-time audio/video streaming loops
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// =================================================================
// 🖥️ MASTER SERVER CLUSTER SCHEMA
// =================================================================
const serverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "SERVER_NAME_REQUIRED"],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [250, "DESCRIPTION_EXCEEDS_CEILING"]
    },
    iconUrl: {
        type: String,
        default: "/public/presets/default_server_grid.png"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "SERVER_OWNER_REQUIRED"]
    },
    
    // Unique invitation code (e.g., "NEXUS-A79B")
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    
    isPrivate: {
        type: Boolean,
        default: true
    },

    // 🔐 Member limit (max 10 for initial scaling)
    maxMembers: {
        type: Number,
        default: 10,
        min: 1,
        max: 50   // future scaling
    },

    // 🗑️ Soft archive / deletion flag
    isArchived: {
        type: Boolean,
        default: false
    },

    // =================================================================
    // 👥 MEMBER MANAGEMENT ARRAY MATRIX
    // =================================================================
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['Owner', 'Moderator', 'Operator'],
            default: 'Operator'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Queue for pending join requests (private servers only)
    pendingRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // =================================================================
    // 📂 CHANNEL STRUCTURE NESTING
    // =================================================================
    channels: [channelSchema]

}, {
    timestamps: true
});

// =================================================================
// 🏎️ PERFORMANCE TUNING HIGH-SPEED INDEX ARRAYS
// =================================================================
serverSchema.index({ owner: 1, isArchived: 1 });
serverSchema.index({ 'members.user': 1, isArchived: 1 });

// =================================================================
// PRE-SAVE HOOK: Ensure default channels exist
// =================================================================
serverSchema.pre('save', function (next) {
    if (this.channels.length === 0) {
        this.channels.push(
            { name: 'announcements', type: 'TEXT' },
            { name: 'general-chat', type: 'TEXT' },
            { name: 'voice-mesh-comms', type: 'VOICE_MESH' }
        );
    }
    next();
});

// =================================================================
// PRE-SAVE HOOK: Automatically add owner to members array as 'Owner'
// =================================================================
serverSchema.pre('save', async function (next) {
    // If owner is not already in members, add them at the beginning as Owner
    const ownerExists = this.members.some(member => 
        member.user && member.user.equals(this.owner)
    );
    
    if (!ownerExists && this.owner) {
        this.members.unshift({
            user: this.owner,
            role: 'Owner',
            joinedAt: new Date()
        });
    }
    
    next();
});

// =================================================================
// INSTANCE METHODS
// =================================================================

// Generate a unique invite code (6 characters uppercase hex)
serverSchema.methods.generateInviteCode = function () {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    this.inviteCode = code;
    return code;
};

// Check if adding a new member would exceed maxMembers
serverSchema.methods.canAddMember = function () {
    return this.members.length < this.maxMembers;
};

// Add a member to the server (returns true if successful)
serverSchema.methods.addMember = async function (userId, role = 'Operator') {
    if (!this.canAddMember()) {
        throw new Error('SERVER_MEMBER_LIMIT_REACHED');
    }
    
    const alreadyMember = this.members.some(m => m.user.equals(userId));
    if (alreadyMember) {
        throw new Error('USER_ALREADY_IN_SERVER');
    }
    
    this.members.push({
        user: userId,
        role,
        joinedAt: new Date()
    });
    
    // Remove from pending requests if present
    this.pendingRequests = this.pendingRequests.filter(id => !id.equals(userId));
    
    return true;
};

// Remove a member (cannot remove owner)
serverSchema.methods.removeMember = function (userId) {
    if (this.owner.equals(userId)) {
        throw new Error('CANNOT_REMOVE_SERVER_OWNER');
    }
    
    this.members = this.members.filter(m => !m.user.equals(userId));
    return true;
};

// Promote/demote member role
serverSchema.methods.setMemberRole = function (userId, newRole) {
    const member = this.members.find(m => m.user.equals(userId));
    if (!member) {
        throw new Error('MEMBER_NOT_FOUND');
    }
    if (member.role === 'Owner') {
        throw new Error('CANNOT_CHANGE_OWNER_ROLE');
    }
    member.role = newRole;
    return true;
};

// Create a new channel
serverSchema.methods.createChannel = function (channelName, channelType = 'TEXT') {
    // Prevent duplicate channel names
    const exists = this.channels.some(c => c.name === channelName.toLowerCase());
    if (exists) {
        throw new Error('CHANNEL_NAME_ALREADY_EXISTS');
    }
    
    this.channels.push({
        name: channelName,
        type: channelType
    });
    return this.channels[this.channels.length - 1];
};

// Delete a channel (cannot delete default channels)
serverSchema.methods.deleteChannel = function (channelId) {
    const channel = this.channels.id(channelId);
    if (!channel) {
        throw new Error('CHANNEL_NOT_FOUND');
    }
    // Prevent deletion of default channels
    const defaultChannelNames = ['announcements', 'general-chat', 'voice-mesh-comms'];
    if (defaultChannelNames.includes(channel.name)) {
        throw new Error('CANNOT_DELETE_DEFAULT_CHANNEL');
    }
    
    // Safest Mongoose method for subdocument array dropping
    channel.ownerDocument().channels.pull(channelId);
    return true;
};

// =================================================================
// STATIC METHODS
// =================================================================
serverSchema.statics.findByInviteCode = function (inviteCode) {
    return this.findOne({ inviteCode, isArchived: false });
};

serverSchema.statics.findUserServers = function (userId) {
    return this.find({
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ],
        isArchived: false
    });
};

const Server = mongoose.model('Server', serverSchema);
export default Server;