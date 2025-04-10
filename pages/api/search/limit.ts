import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { requireAuth } from "../../../utils/auth";
import { checkSearchLimit } from "../../../utils/db-schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(req, res, async (req, res) => {
    if (req.method === "GET") {
      const session = await getSession({ req });
      const userId = session?.user?.email;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      try {
        // Check if the user has reached their search limit
        const canSearch = await checkSearchLimit(userId);
        
        return res.status(200).json({
          canSearch,
          message: canSearch 
            ? "You can perform searches" 
            : "You have reached your daily search limit"
        });
      } catch (error) {
        console.error("Error checking search limit:", error);
        return res.status(500).json({ error: "Failed to check search limit" });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  });
} 