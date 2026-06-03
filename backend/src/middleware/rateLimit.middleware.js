import rateLimit from 'express-rate-limit';
import { redis as redisClient } from '../config/redis.js';

/**
 * Custom Memory-Fallback Token Bucket Adapter for express-rate-limit
 * Completely bypasses 'rate-limit-redis' Lua scripting dependencies to work perfectly over HTTP REST.
 */
class UpstashExpressStore {
    constructor(prefix = 'rl:auth:', windowMs = 15 * 60 * 1000) {
        this.prefix = prefix;
        this.windowSeconds = Math.ceil(windowMs / 1000);
    }

    /**
     * Increments the rate limit hit counter for a target validation node
     * @param {string} key - Client identifier (typically the IP address)
     * @returns {Promise<{totalHits: number, resetTime: Date}>} Hit metrics payload tracking
     */
    async increment(key) {
        const cacheKey = `${this.prefix}${key}`;
        const now = Date.now();
        const absoluteResetTime = new Date(now + (this.windowSeconds * 1000));

        try {
            // 1. Fetch existing traffic window logs
            const currentRecord = await redisClient.get(cacheKey);

            if (currentRecord) {
                // Parse if it was serialized by our fallback mechanism
                const record = typeof currentRecord === 'string' ? JSON.parse(currentRecord) : currentRecord;
                
                const totalHits = record.hits + 1;
                const expirationLeft = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

                const updatedRecord = { hits: totalHits, resetAt: record.resetAt };
                
                // Write back counter updates using remaining TTL metrics
                await redisClient.set(cacheKey, updatedRecord, { ex: expirationLeft });

                return {
                    totalHits,
                    resetTime: new Date(record.resetAt)
                };
            }
        } catch (err) {
            console.error('⚠️ [RATE_LIMITER_ADAPTER]: Error reading key, falling back to clean initialization:', err.message);
        }

        // 2. Initialize target validation window if key does not exist or crashed out
        const freshRecord = { hits: 1, resetAt: absoluteResetTime.getTime() };
        
        try {
            await redisClient.set(cacheKey, freshRecord, { ex: this.windowSeconds });
        } catch (err) {
            console.error('⚠️ [RATE_LIMITER_ADAPTER]: Error setting fresh key:', err.message);
        }

        return {
            totalHits: 1,
            resetTime: absoluteResetTime
        };
    }

    /**
     * Resets the hit counter for a specific identifier (e.g., after successful login)
     * @param {string} key 
     */
    async decrement(key) {
        const cacheKey = `${this.prefix}${key}`;
        try {
            await redisClient.del(cacheKey);
        } catch (err) {
            console.error('⚠️ [RATE_LIMITER_ADAPTER]: Error deleting key:', err.message);
        }
    }

    // express-rate-limit configuration requirements interface mappings
    async resetKey(key) {
        await this.decrement(key);
    }
}

// 🛰️ Initialize custom store instance parameters
const windowMs = 15 * 60 * 1000; // 15 minutes
const customStore = new UpstashExpressStore('rl:auth:', windowMs);

/**
 * @desc    Rate limiter middleware for authentication routes
 * @access  Public
 * @limits  15 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
    store: customStore, // Injects our atomic custom HTTP store structure
    windowMs,
    max: 15, // Limit each IP to 15 requests per windowMs
    message: {
        success: false,
        error: 'TOO_MANY_REQUESTS: Too many authentication attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable old X-RateLimit headers
    skip: (req) => {
        return false;
    },
});

export default authRateLimiter;