import mongoose from 'mongoose';

// =================================================================
// 🧪 NESTED INDIVIDUAL TEST CASE TRACKING SCHEMA (DSA Round)
// =================================================================
const testCaseResultSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    actualOutput: { type: String },
    passed: { type: Boolean, required: true },
    runtime: { type: Number },        // milliseconds
    memoryUsed: { type: Number },     // KB
    errorMessage: { type: String, default: null }
});

// =================================================================
// 📚 THEORY / MCQ QUESTION SUBSCHEMA
// =================================================================
const theoryQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    userAnswer: { type: String },
    correctAnswer: { type: String },
    isCorrect: { type: Boolean, default: false },
    explanation: { type: String, default: "" }
});

// =================================================================
// 🎙️ VOICE INTERVIEW Q&A SUBSCHEMA
// =================================================================
const voiceQASchema = new mongoose.Schema({
    interviewerQuestion: { type: String, required: true },
    userAnswer: { type: String, default: "" },
    aiFeedback: { type: String, default: "" },
    sentimentScore: { type: Number, min: 0, max: 100 },  // clarity/confidence
    keywordsMatched: [{ type: String }]
});

// =================================================================
// 🏆 ACHIEVEMENT ENTRY
// =================================================================
const achievementSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['CODE_EFFICIENCY', 'THEORY_ACCURACY', 'VOICE_CLARITY', 'SPEED', 'CONSISTENCY'],
        required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true }
});

// =================================================================
// ❌ MISTAKE ENTRY
// =================================================================
const mistakeSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['LOGIC_ERROR', 'SYNTAX', 'THEORY_GAP', 'VOCAL_HESITATION', 'TIME_MANAGEMENT'],
        required: true 
    },
    topic: { type: String, required: true },   // e.g., "Binary Search"
    description: { type: String, required: true },
    suggestion: { type: String, required: true }
});

// =================================================================
// 📊 MASTER REPORT CORE ENGINE SCHEMA
// =================================================================
const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "REPORT_USER_OWNER_REQUIRED"]
    },
    
    // =================================================================
    // 🎯 INTERVIEW SESSION CONTEXT
    // =================================================================
    sessionContext: {
        topic: { type: String, required: true },          // e.g., "Data Structures & Algorithms"
        difficulty: { 
            type: String, 
            enum: ['EASY', 'MEDIUM', 'HARD'],
            required: true 
        },
        duration: { type: Number, required: true },       // total minutes (planned)
        actualDuration: { type: Number, default: 0 },     // actual minutes taken
        roundsCompleted: [{ 
            type: String, 
            enum: ['DSA', 'THEORY', 'VOICE'],
            default: []
        }]
    },

    // =================================================================
    // 💻 DSA ROUND (sandbox execution metadata)
    // =================================================================
    sandbox: {
        language: {
            type: String,
            enum: ['cpp', 'javascript', 'python'],
            default: 'cpp'
        },
        sourceCode: { type: String, required: true },
        compilationStatus: {
            type: String,
            enum: ['SUCCESS', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIMEOUT'],
            required: true
        },
        compilerOutput: { type: String, default: "" }
    },

    metrics: {
        totalTestCases: { type: Number, default: 0 },
        passedTestCases: { type: Number, default: 0 },
        accuracyScore: { 
            type: Number, 
            default: 0, 
            min: 0, 
            max: 100 
        },
        averageRuntime: { type: Number, default: 0 },
        peakMemory: { type: Number, default: 0 }
    },

    testCases: [testCaseResultSchema],

    // =================================================================
    // 📚 THEORY / MCQ ROUND
    // =================================================================
    theoryRound: {
        questions: [theoryQuestionSchema],
        score: { type: Number, default: 0 },          // raw score (e.g., 7/10)
        percentage: { type: Number, default: 0, min: 0, max: 100 }
    },

    // =================================================================
    // 🎙️ VOICE INTERVIEW ROUND
    // =================================================================
    voiceRound: {
        transcript: [voiceQASchema],
        overallClarity: { type: Number, default: 0, min: 0, max: 100 },
        confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
        totalQuestionsAsked: { type: Number, default: 0 }
    },

    // =================================================================
    // 🤖 GEMINI AI EVALUATION INSIGHTS (DSA specific)
    // =================================================================
    aiEvaluation: {
        complexityAnalysis: {
            timeComplexity: { type: String, default: "N/A" },
            spaceComplexity: { type: String, default: "N/A" }
        },
        feedbackSummary: { type: String, default: "Awaiting system neural engine evaluation sequence..." },
        optimizationSuggestions: [{ type: String }]
    },

    // =================================================================
    // 🏆 ACHIEVEMENTS & MISTAKES (Structured for user insights)
    // =================================================================
    achievements: [achievementSchema],
    mistakes: [mistakeSchema],

    // =================================================================
    // 📈 COMPREHENSIVE STATISTICAL SUMMARY
    // =================================================================
    statisticalSummary: {
        overallScore: { type: Number, default: 0, min: 0, max: 100 },
        dsaContribution: { type: Number, default: 40 },   // weight %
        theoryContribution: { type: Number, default: 30 },
        voiceContribution: { type: Number, default: 30 },
        timeManagement: { 
            type: String, 
            enum: ['FAST', 'OPTIMAL', 'SLOW'],
            default: 'OPTIMAL'
        },
        percentileRank: { type: Number, default: 0 }
    },

    // =================================================================
    // 💬 APPRECIATION & FINAL MESSAGE + IMPROVEMENT TOPICS
    // =================================================================
    appreciationMessage: { type: String, default: "" },
    improvementTopics: [{ type: String }],   // e.g., ["Dynamic Programming", "Linked Lists"]

    isPublic: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// =================================================================
// 🏎️ DATABASE INDEXES (performance optimized for soft-deletion)
// =================================================================
reportSchema.index({ user: 1, isDeleted: 1, createdAt: -1 });
reportSchema.index({ 'statisticalSummary.overallScore': -1, isDeleted: 1 });
reportSchema.index({ isPublic: 1, isDeleted: 1 });

// =================================================================
// 🛠️ INSTANCE METHODS
// =================================================================

// Recalculate DSA metrics from testCases
reportSchema.methods.calculateDSAMetrics = function () {
    const total = this.testCases.length;
    if (total === 0) return;

    const passed = this.testCases.filter(tc => tc.passed).length;
    this.metrics.totalTestCases = total;
    this.metrics.passedTestCases = passed;
    this.metrics.accuracyScore = Math.round((passed / total) * 100);

    let validRuns = 0;
    let totalTime = 0;
    let maxMem = 0;

    this.testCases.forEach(tc => {
        if (tc.passed) {
            validRuns++;
            if (tc.runtime) totalTime += tc.runtime;
        }
        if (tc.memoryUsed && tc.memoryUsed > maxMem) maxMem = tc.memoryUsed;
    });

    this.metrics.averageRuntime = validRuns > 0 ? parseFloat((totalTime / validRuns).toFixed(2)) : 0;
    this.metrics.peakMemory = maxMem;
};

// Recalculate theory round percentage
reportSchema.methods.calculateTheoryMetrics = function () {
    const total = this.theoryRound.questions.length;
    if (total === 0) return;
    
    const correct = this.theoryRound.questions.filter(q => q.isCorrect).length;
    this.theoryRound.score = correct;
    this.theoryRound.percentage = Math.round((correct / total) * 100);
};

// Calculate weighted overall score
reportSchema.methods.calculateOverallScore = function () {
    const dsa = this.metrics.accuracyScore || 0;
    const theory = this.theoryRound.percentage || 0;
    const voice = this.voiceRound.overallClarity || 0;
    
    // Fallback safe assignment to prevent initial pre-save NaN bugs
    const dsaWeight = this.statisticalSummary?.dsaContribution ?? 40;
    const theoryWeight = this.statisticalSummary?.theoryContribution ?? 30;
    const voiceWeight = this.statisticalSummary?.voiceContribution ?? 30;
    
    const overall = (dsa * (dsaWeight / 100)) +
                    (theory * (theoryWeight / 100)) +
                    (voice * (voiceWeight / 100));
    
    this.statisticalSummary.overallScore = Math.round(overall);
    
    // Determine time management metrics cleanly
    if (this.sessionContext.actualDuration && this.sessionContext.duration) {
        const ratio = this.sessionContext.actualDuration / this.sessionContext.duration;
        if (ratio <= 0.8) this.statisticalSummary.timeManagement = 'FAST';
        else if (ratio >= 1.2) this.statisticalSummary.timeManagement = 'SLOW';
        else this.statisticalSummary.timeManagement = 'OPTIMAL';
    }
};

// =================================================================
// 🛡️ LIFECYCLE PRE-SAVE HOOK
// =================================================================
reportSchema.pre('save', function (next) {
    if (this.testCases && this.testCases.length > 0) {
        this.calculateDSAMetrics();
    }
    if (this.theoryRound && this.theoryRound.questions && this.theoryRound.questions.length > 0) {
        this.calculateTheoryMetrics();
    }
    this.calculateOverallScore();
    next();
});

// =================================================================
// STATIC METHODS
// =================================================================
reportSchema.statics.findPublicReportsByUser = function (userId) {
    return this.find({ user: userId, isPublic: true, isDeleted: false }).sort({ createdAt: -1 });
};

reportSchema.statics.findTopReports = function (limit = 10) {
    return this.find({ isDeleted: false })
        .sort({ 'statisticalSummary.overallScore': -1 })
        .limit(limit)
        .populate('user', 'name avatarUrl');
};

const Report = mongoose.model('Report', reportSchema);
export default Report;