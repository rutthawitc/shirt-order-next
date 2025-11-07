import Redis from 'ioredis';

let redis: Redis | null = null;
let isInitializing = false;
let initializationError: Error | null = null;

// Initialize Redis only if URL is provided
function initializeRedis(): Redis | null {
  if (isInitializing) {
    return null;
  }

  if (redis) {
    return redis;
  }

  if (initializationError) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('[Redis] REDIS_URL not provided - using in-memory fallback');
    return null;
  }

  try {
    isInitializing = true;

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    // Handle connection errors
    redis.on('error', (error) => {
      console.error('[Redis] Connection error:', error.message);
      initializationError = error;
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
      initializationError = null;
    });

    redis.on('ready', () => {
      console.log('[Redis] Ready to accept commands');
    });

    redis.on('close', () => {
      console.warn('[Redis] Connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    // Attempt to connect
    redis.connect().catch((error) => {
      console.error('[Redis] Failed to connect:', error.message);
      initializationError = error;
      redis = null;
    });

    isInitializing = false;
    return redis;
  } catch (error) {
    console.error('[Redis] Initialization error:', error);
    initializationError = error instanceof Error ? error : new Error(String(error));
    isInitializing = false;
    return null;
  }
}

// Export a getter function instead of the instance directly
export function getRedis(): Redis | null {
  if (!redis && !initializationError && !isInitializing) {
    return initializeRedis();
  }
  return redis;
}

// For backward compatibility, export default as well
// But this will only initialize on first import
const redisInstance = initializeRedis();
export default redisInstance;
