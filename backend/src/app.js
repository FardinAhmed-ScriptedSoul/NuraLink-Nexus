import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/config.js';

const app = express();

// ==========================================
// 🛡️ GLOBAL MIDDLEWARE SUITE CONFIGURATIONS
// ==========================================

// Enforce strict Cross-Origin Policy rules matching your React workspace layout
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Global body parsers to catch handling limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse secure HttpOnly incoming auth signatures
app.use(cookieParser());

// Static data pipelines for user file profile tracking
app.use('/public', express.static('public'));

// ==========================================
// 🚦 CORE ENDPOINT ROUTING INJECTIONS
// ==========================================

// Basic core diagnostics health vector
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: "OPERATIONAL",
        kernel_time: new Date(),
        environment: config.env
    });
});

// Placeholders for your project routes (uncomment as we create them)
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/user', userRouter);
// app.use('/api/v1/server', serverRouter);
// app.use('/api/v1/sandbox', sandboxRouter);

// ==========================================
// 🚨 GLOBAL FAULT-TOLERANCE EXCEPTION RADAR
// ==========================================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `ROUTING_VECTOR_NOT_FOUND: [${req.method}] ${req.originalUrl}`
    });
});

app.use((err, req, res, next) => {
    console.error(`❌ [KERNEL_EXCEPTION]:`, err.stack || err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "INTERNAL_SYSTEM_COMPILATION_ERROR"
    });
});

export default app;