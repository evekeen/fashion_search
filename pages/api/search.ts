import { NextApiRequest, NextApiResponse } from 'next';
import { searchProducts, batchSearchProducts } from '../../services/search';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, queries } = req.body;

    // Handle batch search requests
    if (queries && Array.isArray(queries)) {
      if (queries.length === 0) {
        return res.status(400).json({ error: 'At least one query is required' });
      }

      const results = await batchSearchProducts(queries);
      return res.status(200).json({ results });
    }
    
    // Handle single search request
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchProducts(query);
    
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }
    
    return res.status(200).json({ results });
  } catch (error) {
    console.error('Error in search:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}