import mongoose from 'mongoose';

const scheduledTaskSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "TASK_CREATOR_REQUIRED"]
    },
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        required: [true, "TARGET_SERVER_REQUIRED"]
    },
    // References the underlying _id subdocument within Server.channels
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "TARGET_CHANNEL_ID_REQUIRED"]
    },
    // Denormalized string value to instantly render the target channel label in UI lists
    channelName: {
        type: String,
        required: [true, "TARGET_CHANNEL_NAME_REQUIRED"],
        trim: true,
        lowercase: true
    },
    
    taskType: {
        type: String,
        enum: ['AI_ANNOUNCEMENT', 'SYSTEM_CLEANUP', 'MAINTENANCE_ALERT'],
        default: 'AI_ANNOUNCEMENT'
    },
    
    payload: {
        content: { type: String, required: [true, "TASK_PAYLOAD_CONTENT_REQUIRED"] },
        metadata: { type: Map, of: String } // Flexible structure for basic contextual mapping strings
    },
    
    // =================================================================
    // ⏰ CRON TIMING AND LIFECYCLE MANAGEMENT FLAGS
    // =================================================================
    scheduledFor: {
        type: Date,
        required: [true, "EXECUTION_TIMESTAMP_REQUIRED"]
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3 // Fail-safe limit for retry loops
    },
    lastError: {
        type: String,
        default: null
    },
    executedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// =================================================================
// 🏎️ PERFORMANCE COMPRESSION TUNING INDEXES
// =================================================================
scheduledTaskSchema.index({ status: 1, scheduledFor: 1 });
scheduledTaskSchema.index({ server: 1, status: 1 });

// =================================================================
// 🛠️ LIFECYCLE SCHEMA STATIC METHODS
// =================================================================
scheduledTaskSchema.statics.findPendingTasks = function () {
    return this.find({
        status: 'PENDING',
        scheduledFor: { $lte: new Date() },
        attempts: { $lt: 3 }
    });
};

const ScheduledTask = mongoose.model('ScheduledTask', scheduledTaskSchema);
export default ScheduledTask;