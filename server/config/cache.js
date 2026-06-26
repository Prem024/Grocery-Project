const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL;
let cacheClient;

const createCacheClient = async () => {
  if (cacheClient) {
    return cacheClient;
  }

  if (!REDIS_URL) {
    return null;
  }

  cacheClient = redis.createClient({ url: REDIS_URL });

  cacheClient.on('error', (error) => {
    console.error('Redis cache error:', error);
  });

  await cacheClient.connect();
  return cacheClient;
};

const getCache = async (key) => {
  const client = await createCacheClient();
  if (!client) return null;
  return client.get(key);
};

const setCache = async (key, value, ttlSeconds) => {
  const client = await createCacheClient();
  if (!client) return;
  if (ttlSeconds && ttlSeconds > 0) {
    await client.setEx(key, ttlSeconds, value);
  } else {
    await client.set(key, value);
  }
};

const delCache = async (key) => {
  const client = await createCacheClient();
  if (!client) return;
  await client.del(key);
};

module.exports = { getCache, setCache, delCache };
