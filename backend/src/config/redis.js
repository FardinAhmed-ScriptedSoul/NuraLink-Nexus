import Redis from 'ioredis';
import config from './config.js';

let redisClient = null;

if (config.redis.uri) {
    try {
        // ioredis initializes connection instantly using the secure rediss:// protocol link
        redisClient = new Redis(config.redis.uri, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) {
                    console.warn('⚠️ Upstash Redis connection retries exceeded. Falling back to database storage safety layers.');
                    redisClient = null;
                    return null; // Stop retrying
                }
                return Math.min(times * 200, 2000);
            }
        });

        redisClient.on('connect', () => {
            console.log('⚡ Redis Connected Successfully (Upstash RAM Engine Active)');
        });

        redisClient.on('error', (err) => {
            console.error('🔴 Redis Client Runtime Error:', err.message);
        });
    } catch (err) {
        console.error('⚠️ Redis Initialization Failed:', err.message);
        redisClient = null;
    }
} else {
    console.log('ℹ️ No REDIS_URL provided. Session/Blacklist management defaulting to MongoDB engine.');
}

export default redisClient;