import mongoose from 'mongoose';
import config from './config.js';

async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(config.db.uri);
        console.log(`✅ MongoDB Connection Established! Host Target: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Failure: ${error.message}`);
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection context lost. Re-establishing connection...');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ Active MongoDB network channel error encountered: ${err}`);
});

export default connectDB;