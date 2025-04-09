import { SearchResult } from '../../types/api';

interface SerperSearchParams {
  q: string;
  location?: string;
  num?: number;
}

interface SerperShoppingResult {
  title: string;
  source: string;
  link: string;
  price: string;
  delivery?: string;
  imageUrl: string;
  rating?: number;
  ratingCount?: number;
  productId?: string;
  position?: number;
  offers?: string;
}

interface SerperShoppingResponse {
  searchParameters: {
    q: string;
    type: string;
    location: string;
    engine: string;
    gl: string;
  };
  shopping: SerperShoppingResult[];
  credits: number;
}

/**
 * Helper to handle fetch requests with proper error handling
 */
async function fetchWithErrorHandling(url: string, options: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw new Error(`Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for products using Serper.dev Google Shopping API
 * 
 * @param query Search query string
 * @returns Promise with array of search results
 */
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const API_KEY = process.env.SERPERDEV_API_KEY;
  const API_BASE_URL = "https://google.serper.dev/shopping";
  
  if (!API_KEY) {
    console.error("SERPERDEV_API_KEY environment variable is not set");
    throw new Error("SERPERDEV_API_KEY environment variable is not set");
  }

  if (!query) {
    console.error("Search query is required");
    throw new Error("Search query is required");
  }

  try {
    console.log(`Initiating Serper.dev request for query: '${query}'`);
    
    // Build request body
    const requestBody: SerperSearchParams = {
      q: `${query} fashion clothing`,
      location: "United States",
      num: 10
    };
    
    // Make the API request
    const response = await fetchWithErrorHandling(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json() as SerperShoppingResponse;
    
    if (!data.shopping || data.shopping.length === 0) {
      console.log(`No results found for query: '${query}'`);
      return [];
    }
    
    console.log(`Serper.dev request completed. Found ${data.shopping.length} products.`);
    
    // Map Serper.dev results to our SearchResult interface
    return data.shopping.map(product => ({
      description: product.title || '',
      price: product.price || '',
      thumbnailURL: product.imageUrl || '',
      productURL: product.link || '',
      rating: product.rating
    }));
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error in Serper.dev search: ${error.message}`);
      console.error(error.stack);
    } else {
      console.error('Unknown error in Serper.dev search');
    }
    return [];
  }
}

/**
 * Batch search for products using Serper.dev Google Shopping API
 * 
 * @param queries Array of search queries
 * @returns Promise with record of query to search results
 */
export async function batchSearchProducts(
  queries: string[]
): Promise<Record<string, SearchResult[]>> {
  const API_KEY = process.env.SERPERDEV_API_KEY;
  const API_BASE_URL = "https://google.serper.dev/shopping";
  
  if (!API_KEY) {
    console.error("SERPERDEV_API_KEY environment variable is not set");
    throw new Error("SERPERDEV_API_KEY environment variable is not set");
  }

  if (!queries.length) {
    console.error("At least one search query is required");
    throw new Error("At least one search query is required");
  }

  try {
    console.log(`Initiating Serper.dev batch request for ${queries.length} queries`);
    
    // Process queries in parallel with a concurrency limit
    const results: Record<string, SearchResult[]> = {};
    const batchSize = 3; // Process 3 queries at a time to avoid overwhelming the API
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batchQueries = queries.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(queries.length/batchSize)}`);
      
      const batchPromises = batchQueries.map(async (query) => {
        try {
          console.log(`Creating request for query: "${query}"`);
          
          // Build request body
          const requestBody: SerperSearchParams = {
            q: `${query} fashion clothing`,
            location: "United States",
            num: 10
          };
          
          // Make the API request
          const response = await fetchWithErrorHandling(API_BASE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': API_KEY
            },
            body: JSON.stringify(requestBody)
          });
          
          const data = await response.json() as SerperShoppingResponse;
          
          if (!data.shopping || data.shopping.length === 0) {
            console.log(`No results found for query: '${query}'`);
            return { query, searchResults: [] };
          }
          
          console.log(`Serper.dev request completed for query "${query}". Found ${data.shopping.length} products.`);
          
          // Map Serper.dev results to our SearchResult interface
          const searchResults = data.shopping.map(product => ({
            description: product.title || '',
            price: product.price || '',
            thumbnailURL: product.imageUrl || '',
            productURL: product.link || '',
            rating: product.rating
          }));
          
          return { query, searchResults };
        } catch (error) {
          console.error(`Error searching for query "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          return { query, searchResults: [] };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Add batch results to overall results
      batchResults.forEach(({ query, searchResults }) => {
        results[query] = searchResults;
      });
      
      // Add a delay between batches if there are more batches to process
      if (i + batchSize < queries.length) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error in Serper.dev batch search: ${error.message}`);
      console.error(error.stack);
    } else {
      console.error('Unknown error in Serper.dev batch search');
    }
    return {};
  }
}