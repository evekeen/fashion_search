import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  return handler(req, res);
}

export async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  return session?.user;
} 