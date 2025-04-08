import { NextApiRequest, NextApiResponse } from 'next';
import { StyleResponse } from '../../types/api';
import { generateStyleImageWithReplicate } from '../../services/replicate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, data } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  try {
    switch (action) {
      case 'generateStyleImage':
        if (!data || !data.recommendation) {
          return res.status(400).json({ error: 'Recommendation data is required' });
        }
        const imageURL = await generateStyleImageWithReplicate(data.recommendation as StyleResponse);
        return res.status(200).json({ 
          image: imageURL
        });

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error(`Error processing Replicate action ${action}:`, error);
    return res.status(500).json({ 
      error: `Failed to process Replicate action: ${action}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}