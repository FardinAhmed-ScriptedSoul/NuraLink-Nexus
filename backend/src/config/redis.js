import { Redis } from '@upstash/redis';
import config from './config.js';

/** @type {Redis|null} */
let primaryClient = null;

/** * Local in-memory key-value cache fallback matrix 
 * @type {Map<string, string>} 
 */
const memoryFallbackDb = new Map();

/** * Map tracking active setTimeout references to prevent race-condition premature evictions 
 * @type {Map<string, NodeJS.Timeout>} 
 */
const memoryTimeouts = new Map();

// Track configuration completeness
const isUpstashConfigured = !!(config.redis?.url && config.redis?.token);

if (isUpstashConfigured) {
    try {
        primaryClient = new Redis({
            url: config.redis.url,
            token: config.redis.token,
        });
        console.log('⚡ [DATALAYER]: Upstash Redis REST pipeline channel initialized.');
    } catch (error) {
        console.error('🚨 [DATALAYER FAULT]: Failed initializing Upstash client. Bootstrapping memory fallback:', error.message);
    }
} else {
    console.warn('ℹ️ [DATALAYER NOTICE]: Credentials missing. Defaulting cluster cache to local in-memory buffers.');
}

/**
 * 🛰️ Unified Cloud Storage Adapter Interface
 * Standardizes operation signatures so controllers never know (or care) if data is in a local Map or Upstash Cloud.
 */
export const redis = {
    /**
     * Read a string or parsed object value from the memory matrix
     * @param {string} key - Cache namespace key parameter
     * @returns {Promise<any|null>} Clean Javascript structure or null
     */
    get: async (key) => {
        if (isUpstashConfigured && primaryClient) {
            try {
                return await primaryClient.get(key);
            } catch (err) {
                console.error(`⚠️ [UPSTASH READ FAULT]: Key "${key}" redirected to memory fallback. Reason:`, err.message);
                const localValue = memoryFallbackDb.get(key);
                return localValue ? JSON.parse(localValue) : null;
            }
        }
        const localValue = memoryFallbackDb.get(key);
        return localValue ? JSON.parse(localValue) : null;
    },

    /**
     * Store key-value maps with explicit expiration metrics and active eviction overlap protection
     * @param {string} key - Cache namespace key descriptor
     * @param {any} value - Primitive string, array, or object properties payload
     * @param {Object} [options] - Eviction settings parameters
     * @param {number} [options.ex] - Time-To-Live (TTL) duration allocation measured in seconds
     * @returns {Promise<string>} Static confirmation flag acknowledgment 'OK'
     */
    set: async (key, value, options = {}) => {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

        // 1. Process writes against the primary Cloud service if active
        if (isUpstashConfigured && primaryClient) {
            try {
                await primaryClient.set(key, serializedValue, options);
            } catch (err) {
                console.error(`⚠️ [UPSTASH WRITE FAULT]: Distributed cloud sync failed for key "${key}". Writing to local fallback matrix. Reason:`, err.message);
            }
        }

        // 2. Clear old timeout tracking records before setting a new one to kill TTL overlap bugs
        if (memoryTimeouts.has(key)) {
            clearTimeout(memoryTimeouts.get(key));
            memoryTimeouts.delete(key);
        }

        // 3. Mirror payload changes to fallback cache state logs
        memoryFallbackDb.set(key, serializedValue);

        // ⏳ Emulate Upstash Redis TTL Expiration policy tracking inside the fallback Map Engine safely
        if (options?.ex && typeof options.ex === 'number') {
            const timeoutId = setTimeout(() => {
                if (memoryFallbackDb.has(key)) {
                    memoryFallbackDb.delete(key);
                    memoryTimeouts.delete(key);
                    console.log(`扫 [FALLBACK MEMORY EVIC]: Volatile cache key "${key}" self-evicted cleanly.`);
                }
            }, options.ex * 1000);

            memoryTimeouts.set(key, timeoutId);
        }

        return 'OK';
    },

    /**
     * Flush historical data tracking records out of memory blocks instantly
     * @param {string} key - Cache namespace tracking token target
     * @returns {Promise<number>} Returns 1 if key existed and was deleted, 0 if it didn't exist
     */
    del: async (key) => {
        let cloudDeleteSuccess = false;

        if (isUpstashConfigured && primaryClient) {
            try {
                const response = await primaryClient.del(key);
                cloudDeleteSuccess = response > 0;
            } catch (err) {
                console.error(`⚠️ [UPSTASH TRUNCATE FAULT]: Tracking vector key "${key}" purge failed on Cloud. Reason:`, err.message);
            }
        }

        // Clean up tracking timers alongside memory matrices
        if (memoryTimeouts.has(key)) {
            clearTimeout(memoryTimeouts.get(key));
            memoryTimeouts.delete(key);
        }

        const fallbackExisted = memoryFallbackDb.has(key);
        memoryFallbackDb.delete(key);

        return (cloudDeleteSuccess || fallbackExisted) ? 1 : 0;
    }
};