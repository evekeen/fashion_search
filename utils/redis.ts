import { createClient } from 'redis';
import { Search } from "./db-schema";

let redis: ReturnType<typeof createClient>;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", (error: Error) => {
      console.error("[redis.ts] Redis connection error:", error);
    });
    redis.on("connect", () => {
      console.log("[redis.ts] Redis connected successfully");
    });
    await redis.connect();
  }
  return redis;
}

export async function trackSearch(userId: string, search: Search): Promise<void> {
  try {
    console.log(`[redis.ts] Tracking search for user: ${userId}`);
    
    const client = await getRedisClient();
    const searchKey = `search:${userId}`;
    const countKey = `search:${userId}:count`;
    
    await client.incr(countKey);
    await client.expire(countKey, 3600);
    
    const searchData = JSON.stringify(search);
    await client.lPush(searchKey, searchData);
    await client.lTrim(searchKey, 0, 99);
    
    console.log(`[redis.ts] Search tracked successfully for user: ${userId}`);
  } catch (error) {
    console.error(`[redis.ts] Error tracking search for user ${userId}:`, error);
    throw error;
  }
}

export async function checkSearchLimit(userId: string): Promise<boolean> {
  try {
    console.log(`[redis.ts] Checking search limit for user: ${userId}`);
    
    const client = await getRedisClient();
    const countKey = `search:${userId}:count`;
    const count = await client.get(countKey);
    
    const limit = parseInt(process.env.SEARCH_LIMIT || "100");
    const currentCount = count ? parseInt(count) : 0;
    
    console.log(`[redis.ts] User ${userId} has ${currentCount} searches out of ${limit} limit`);
    return currentCount < limit;
  } catch (error) {
    console.error(`[redis.ts] Error checking search limit for user ${userId}:`, error);
    throw error;
  }
}

export async function getSearchCount(userId: string): Promise<number> {
  try {
    console.log(`[redis.ts] Getting search count for user: ${userId}`);
    
    const client = await getRedisClient();
    const countKey = `search:${userId}:count`;
    const count = await client.get(countKey);
    
    const searchCount = count ? parseInt(count) : 0;
    console.log(`[redis.ts] User ${userId} has ${searchCount} searches`);
    
    return searchCount;
  } catch (error) {
    console.error(`[redis.ts] Error getting search count for user ${userId}:`, error);
    return 0;
  }
}

export async function debugRedisConnection(): Promise<boolean> {
  try {
    console.log("[redis.ts] Testing Redis connection...");
    const client = await getRedisClient();
    await client.ping();
    console.log("[redis.ts] Redis connection successful");
    return true;
  } catch (error) {
    console.error("[redis.ts] Redis connection failed:", error);
    return false;
  }
} 