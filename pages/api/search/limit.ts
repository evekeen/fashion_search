import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { checkSearchLimit } from "../../../utils/db-schema";
import { getSearchCount } from "../../../utils/redis";

async function getSearchCountWithFallback(userId: string): Promise<number> {
  try {
    return await getSearchCount(userId);
  } catch (error) {
    console.error('Error getting search count from Redis, falling back to memory store:', error);
    const { getSearchCount } = await import('../../../utils/memory-store');
    return getSearchCount(userId);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("[limit.ts] Received search limit request");
    
    // Try to get the user ID using getToken which is more reliable in API routes
    let userId = null;
    try {
      // First try with getToken which is more reliable in API routes
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (token?.email) {
        userId = token.email;
        console.log(`[limit.ts] User authenticated via token: ${userId}`);
      } else {
        // Fallback to getSession
        const session = await getSession({ req });
        if (session?.user?.email) {
          userId = session.user.email;
          console.log(`[limit.ts] User authenticated via session: ${userId}`);
        } else {
          console.log("[limit.ts] No user found in token or session");
        }
      }
    } catch (authError) {
      console.error("[limit.ts] Error getting authentication:", authError);
    }
    
    // Check if we have a valid user ID
    if (!userId) {
      console.error("[limit.ts] No valid user ID found");
      
      // For development, return a default response
      if (process.env.NODE_ENV === "development") {
        console.log("[limit.ts] Development mode: returning default search limit");
        return res.status(200).json({
          canSearch: true,
          searchCount: 0,
          searchLimit: 5,
          remainingSearches: 5,
          message: "Development mode: unlimited searches",
          development: true
        });
      }
      
      return res.status(401).json({ error: "Authentication required" });
    }
    
    console.log(`[limit.ts] Checking search limit for user: ${userId}`);
    
    // Check if the user has reached their search limit
    const canSearch = await checkSearchLimit(userId);
    console.log(`[limit.ts] Can user search? ${canSearch}`);
    
    // Get the current search count
    const searchCount = await getSearchCountWithFallback(userId);
    console.log(`[limit.ts] Search count for user ${userId}: ${searchCount}`);
    
    // Get the search limit from environment variable
    const searchLimit = parseInt(process.env.SEARCH_LIMIT || "5");
    
    return res.status(200).json({
      canSearch,
      searchCount,
      searchLimit,
      remainingSearches: searchLimit - searchCount,
      message: canSearch 
        ? "You can perform searches" 
        : "You have reached your daily search limit"
    });
  } catch (error) {
    console.error("[limit.ts] Error checking search limit:", error);
    return res.status(500).json({ error: "Failed to check search limit" });
  }
} 