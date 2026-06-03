import mongoose from 'mongoose';

// =================================================================
// 📅 DAILY LIGHTWEIGHT ACTIVITY TRACKING SUBSCHEMA
// =================================================================
const dailyLogSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true 
    },
    activeHours: { 
        type: Number, 
        default: 0,
        min: 0
    },
    interviewsAttempted: { 
        type: Number, 
        default: 0 
    }
}, { _id: false });

// =================================================================
// 📊 MASTER AGGREGATED MONTHLY TIME-SERIES LEDGER
// =================================================================
const monthlyReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "MONTHLY_LEDGER_USER_REQUIRED"]
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },

    // =================================================================
    // 📈 CHRONO ACTIVITY LOGS & PERFORMANCE STREAKS
    // =================================================================
    totalActiveHours: { 
        type: Number, 
        default: 0 
    },
    totalLoginDays: { 
        type: Number, 
        default: 0 
    },
    longestStreak: { 
        type: Number, 
        default: 0 
    },
    totalInterviewsProcessed: { 
        type: Number, 
        default: 0 
    },
    totalInterviewsPassed: {
        type: Number,
        default: 0 // Tracks overall successful interview sequences
    },
    avgInterviewScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100 // Running average aggregated across the month's reports
    },
    totalAssistantQueries: {
        type: Number,
        default: 0 
    },
    totalVoiceMinutes: {
        type: Number,
        default: 0 
    },

    dailyActivityMatrix: [dailyLogSchema],

    // =================================================================
    // 🏷️ TOPIC ANALYSIS & METRIC RADARS
    // =================================================================
    topTopics: [{ 
        type: String 
    }],
    dominantWeakness: { 
        type: String, 
        default: "Insufficient dataset for evaluation sequence." 
    },
    coreStrength: { 
        type: String, 
        default: "Insufficient dataset for evaluation sequence." 
    },
    growthAppreciationText: { 
        type: String, 
        default: "Continue system tracking loops to generate comprehensive milestone insights." 
    }

}, { timestamps: true });

// =================================================================
// 🏎️ COMPACT DATABASE HIGH-SPEED COMPRESSION INDEXES
// =================================================================
monthlyReportSchema.index({ user: 1, year: -1, month: -1 }, { unique: true });

// =================================================================
// 🛠️ INSTANCE METHODS (BUSINESS LOGIC CORES)
// =================================================================

// Safely updates streaks and core calendar day trackers
monthlyReportSchema.methods.calculateStreak = function() {
    if (this.dailyActivityMatrix.length === 0) {
        this.longestStreak = 0;
        this.totalLoginDays = 0;
        return;
    }

    // Map to distinct timestamps representing midnights and sort chronologically
    const sorted = this.dailyActivityMatrix
        .map(d => new Date(d.date).setHours(0,0,0,0))
        .sort((a, b) => a - b);
        
    let maxStreak = 0;
    let currentStreak = 0;
    const ONE_DAY_MS = 86400000;

    for (let i = 0; i < sorted.length; i++) {
        if (i === 0) {
            currentStreak = 1;
        } else {
            const difference = sorted[i] - sorted[i-1];
            if (difference === ONE_DAY_MS) {
                currentStreak++;
            } else if (difference > ONE_DAY_MS) {
                // Streak broken by gap space, reset back to base milestone run
                currentStreak = 1;
            }
            // Explicitly handles difference === 0 (multiple logging entries on the same day).
            // It bypasses step count increments while maintaining the current run safely.
        }
        maxStreak = Math.max(maxStreak, currentStreak);
    }

    this.longestStreak = maxStreak;
    this.totalLoginDays = this.dailyActivityMatrix.length;
};

// Logger pipeline helper called by system analytics events
monthlyReportSchema.methods.logDailyActivity = function(targetDate, hours, interviewsCount, assistantQueriesCount = 0, voiceMins = 0) {
    const stringDate = new Date(targetDate).toDateString();
    
    let dayEntry = this.dailyActivityMatrix.find(entry => new Date(entry.date).toDateString() === stringDate);
    
    if (dayEntry) {
        dayEntry.activeHours += hours;
        dayEntry.interviewsAttempted += interviewsCount;
    } else {
        this.dailyActivityMatrix.push({
            date: targetDate,
            activeHours: hours,
            interviewsAttempted: interviewsCount
        });
    }

    // Increment overall historical telemetry snapshots
    this.totalActiveHours = parseFloat((this.dailyActivityMatrix.reduce((acc, curr) => acc + curr.activeHours, 0)).toFixed(2));
    this.totalInterviewsProcessed = this.dailyActivityMatrix.reduce((acc, curr) => acc + curr.interviewsAttempted, 0);
    this.totalAssistantQueries += assistantQueriesCount;
    this.totalVoiceMinutes += voiceMins;

    this.calculateStreak();
};

// Method to safely re-aggregate composite scoring evaluations over runtime updates
monthlyReportSchema.methods.updateInterviewPerformance = function(score, passedFlag) {
    if (passedFlag) {
        this.totalInterviewsPassed += 1;
    }
    
    // Compute moving average calculation cleanly
    const totalReports = this.totalInterviewsProcessed || 1;
    this.avgInterviewScore = Math.round(
        ((this.avgInterviewScore * (totalReports - 1)) + score) / totalReports
    );
};

// =================================================================
// 🛡️ LIFECYCLE PRE-SAVE HOOK
// =================================================================
monthlyReportSchema.pre('save', function (next) {
    // 🚦 Temporal Verification Gate: Block document creations set in future horizons
    const currentClock = new Date();
    const currentYear = currentClock.getFullYear();
    const currentMonth = currentClock.getMonth() + 1; // Base-1 alignment

    if (this.year > currentYear || (this.year === currentYear && this.month > currentMonth)) {
        return next(new Error('TEMPORAL_GATE_VIOLATION: ANOMALOUS_FUTURE_LOG_REJECTED'));
    }

    this.calculateStreak();
    next();
});

const MonthlyReport = mongoose.model('MonthlyReport', monthlyReportSchema);
export default MonthlyReport;