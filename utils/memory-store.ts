// Simple in-memory store for local development
// This is used as a fallback when Redis is not available

interface SearchData {
  userId: string;
  timestamp: string;
  query: any;
  results: any;
}

// Store search counts by user and date
const searchCounts: Record<string, number> = {};

// Store search data
const searchData: Record<string, SearchData> = {};

// Get the key for a user's search count on a specific date
function getSearchCountKey(userId: string, date: string): string {
  return `search:${userId}:${date}`;
}

// Get the key for a specific search
function getSearchDataKey(userId: string, timestamp: number): string {
  return `search:${userId}:${timestamp}`;
}

export async function trackSearch(userId: string, searchData: any): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const searchKey = getSearchCountKey(userId, today.toISOString().split('T')[0]);
  
  // Increment the search count for today
  searchCounts[searchKey] = (searchCounts[searchKey] || 0) + 1;
  
  // Store the search data
  const searchId = getSearchDataKey(userId, Date.now());
  searchData[searchId] = {
    userId,
    timestamp: new Date().toISOString(),
    ...searchData
  };
  
  console.log(`[Memory Store] Search tracked for user: ${userId}, count: ${searchCounts[searchKey]}`);
  console.log(`[Memory Store] All search counts:`, JSON.stringify(searchCounts));
}

export async function checkSearchLimit(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const searchKey = getSearchCountKey(userId, today.toISOString().split('T')[0]);
  
  // Get the current search count for today
  const searchCount = searchCounts[searchKey] || 0;
  
  console.log(`[Memory Store] Checking search limit for user: ${userId}, key: ${searchKey}, count: ${searchCount}`);
  console.log(`[Memory Store] All search counts:`, JSON.stringify(searchCounts));
  
  // Return true if the user has not reached the limit
  return searchCount < 5;
}

export async function getSearchCount(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const searchKey = getSearchCountKey(userId, today.toISOString().split('T')[0]);
  
  // Get the current search count for today
  const count = searchCounts[searchKey] || 0;
  
  console.log(`[Memory Store] Getting search count for user: ${userId}, key: ${searchKey}, count: ${count}`);
  console.log(`[Memory Store] All search counts:`, JSON.stringify(searchCounts));
  
  return count;
}
