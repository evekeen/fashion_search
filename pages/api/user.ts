import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { requireAuth } from "../../utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAuth(req, res, async (req, res) => {
    if (req.method === "GET") {
      const session = await getSession({ req });
      
      return res.status(200).json({
        user: session?.user,
        message: "This is a protected API route"
      });
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  });
} 