import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { requireAuth } from "../../../utils/auth";
import { trackSearch } from "../../../utils/db-schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(req, res, async (req, res) => {
    if (req.method === "POST") {
      const session = await getSession({ req });
      const userId = session?.user?.email;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      try {
        const { timestamp, query, results } = req.body;
        
        // Track the search in our database
        await trackSearch(userId, {
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          query: query || {},
          results: results || {}
        });
        
        return res.status(200).json({
          success: true,
          message: "Search tracked successfully",
          userId
        });
      } catch (error) {
        console.error("Error tracking search:", error);
        return res.status(500).json({ error: "Failed to track search" });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  });
} 