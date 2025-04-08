import { NextApiRequest, NextApiResponse } from 'next';
import { StyleResponse, UserInput } from '../../types/api';
import { 
  analyzeUserPhotos, 
  generateSearchQuery, 
  generateStyleImageWithDalle 
} from '../../services/openai';

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
        const imageURL = await generateStyleImageWithDalle(data.recommendation as StyleResponse);
        return res.status(200).json({ 
          image: imageURL
        });

      case 'generateSearchQuery':
        if (!data || !data.userInput) {
          return res.status(400).json({ error: 'User input is required' });
        }
        const searchQuery = await generateSearchQuery(data.userInput as UserInput);
        return res.status(200).json({ searchQuery });

      case 'analyzeUserPhotos':
        if (!data || !data.photoPaths || !Array.isArray(data.photoPaths)) {
          return res.status(400).json({ error: 'Photo paths array is required' });
        }
        const userAttributes = await analyzeUserPhotos(data.photoPaths as string[]);
        return res.status(200).json({ userAttributes });

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error(`Error processing OpenAI action ${action}:`, error);
    return res.status(500).json({ 
      error: `Failed to process OpenAI action: ${action}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}