import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { checkSearchLimit, trackSearch } from "../../../utils/db-schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let userId = null;
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (token?.email) {
        userId = token.email;
      } else {
        const session = await getSession({ req });
        if (session?.user?.email) {
          userId = session.user.email;
        }
      }
    } catch (authError) {
      console.error("[track.ts] Error getting authentication:", authError);
    }
    
    if (!userId) {      
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const canSearch = await checkSearchLimit(userId);
    
    if (!canSearch) {
      return res.status(429).json({ error: "Search limit reached" });
    }
    
    await trackSearch(userId, req.body);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[track.ts] Error in search tracking:", error);
    return res.status(500).json({ error: "Failed to track search" });
  }
} 