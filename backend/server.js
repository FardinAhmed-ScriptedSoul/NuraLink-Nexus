// backend/server.js
import http from 'http';
import app from './src/app.js';
import config from './src/config/config.js';
import connectDB from './src/config/db.js';

// Global Exception Overwatch
process.on('unhandledRejection', (reason) => {
    console.error('❌ UNHANDLED_ASYNC_REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT_RUNTIME_EXCEPTION:', error.message);
    process.exit(1); 
});

/**
 * ⚡ MASTER OPERATIONAL BOOT ENGINE
 * Ensures data persistence arrays are completely online before mounting network listener channels.
 */
(async () => {
    try {
        console.log('🤖 System Core: Initializing NuraLink-Nexus Infrastructure...');
        
        // 1. Establish database connection clusters
        await connectDB();
        
        // 2. Bind application engine to network server instance
        const server = http.createServer(app);

        // [Future Real-Time Link]: Socket.io initialization hook will anchor directly right here:
        // const io = new Server(server, { cors: { origin: ... } });

        // 3. Mount listen parameters
        server.listen(config.port || 4000, () => {
            console.log(`================================================================`);
            console.log(`📡 NURALINK NEXUS OPERATIONAL NETWORK MATRIX ONLINE`);
            console.log(`🚀 INSTANCE TARGET ADDRESS PORT: http://localhost:${config.port}`);
            console.log(`🛡️ RUNTIME ENVIRONMENT STATE:  ${config.env.toUpperCase()}`);
            console.log(`================================================================`);
        });

    } catch (fatalKernelError) {
        console.error(`❌ FATAL SYSTEM KERNEL INITIATION FAILURE:`, fatalKernelError.message);
        process.exit(1);
    }
})();