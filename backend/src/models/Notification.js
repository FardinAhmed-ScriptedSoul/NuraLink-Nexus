import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // The intended recipient of the alert parameter matrix
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "NOTIFICATION_RECIPIENT_REQUIRED"]
    },
    
    // The user who triggered the notification loop (e.g., sender of join request)
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Can be null for system-automated notifications
    },
    
    // Categorized trigger pathways to tailor frontend UI styling and routing paths
    type: {
        type: String,
        enum: [
            'SERVER_INVITE',      // Someone invited them to a cluster link
            'JOIN_REQUEST',       // Private server join request needing owner/moderator approval
            'JOIN_APPROVAL',      // Sent to a user when their application is accepted
            'MENTION',            // Direct @mention trigger flag inside chat meshes
            'SYSTEM_ALERT',       // Core infrastructure maintenance notifications
            'MILESTONE_ACHIEVED'  // Monthly evaluation progress achievements unlocked
        ],
        required: [true, "NOTIFICATION_TYPE_REQUIRED"]
    },
    
    title: {
        type: String,
        required: [true, "NOTIFICATION_TITLE_REQUIRED"],
        trim: true
    },
    
    message: {
        type: String,
        required: [true, "NOTIFICATION_MESSAGE_REQUIRED"],
        trim: true
    },
    
    // Flexible object to inject contextual routing parameters cleanly
    context: {
        serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
        channelId: { type: mongoose.Schema.Types.ObjectId }, // Subdocument reference match
        reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' }
    },
    
    isRead: {
        type: Boolean,
        default: false
    },
    
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// =================================================================
// 🏎️ DATABASE TUNING INDEXES & SELF-CLEANING INFRASTRUCTURE
// =================================================================
// Speeds up immediate retrieval counts of unread dashboard badges
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// 🧼 AUTOMATED TTL (TIME-TO-LIVE) PURGE SYSTEM
// Automatically wipes notification records exactly 30 days after creation.
// This preserves application scale and prevents standard high-frequency read bottlenecks.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// =================================================================
// 🛠️ INSTANCE METHODS
// =================================================================

// Clean instance helper to handle read states natively inside controllers
notificationSchema.methods.markAsRead = async function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;