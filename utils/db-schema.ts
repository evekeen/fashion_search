// This is a placeholder for a database schema
// In a real application, you would use a database like MongoDB, PostgreSQL, or Firebase

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  searchCount: number;
  lastSearchAt?: Date;
}

export interface Search {
  id: string;
  userId: string;
  timestamp: Date;
  query: {
    inspirationImages: string[];
    profileImage: string;
    styleDescription: string;
  };
  results: {
    style: {
      title: string;
      description: string;
      tags: string[];
    };
    items: Array<{
      category: string;
      description: string;
      price: string;
      productURL: string;
      thumbnailURL: string;
    }>;
  };
}

// Example of how to implement search limits
export async function checkSearchLimit(userId: string): Promise<boolean> {
  try {
    // Use the Redis implementation
    const { checkSearchLimit } = await import('./redis');
    return checkSearchLimit(userId);
  } catch (error) {
    console.error('Error using Redis for search limit, falling back to memory store:', error);
    // Fallback to memory store
    const { checkSearchLimit } = await import('./memory-store');
    return checkSearchLimit(userId);
  }
}

// Example of how to track a search
export async function trackSearch(userId: string, searchData: Omit<Search, 'id' | 'userId'>): Promise<void> {
  try {
    // Use the Redis implementation
    const { trackSearch } = await import('./redis');
    await trackSearch(userId, searchData);
  } catch (error) {
    console.error('Error using Redis for tracking search, falling back to memory store:', error);
    // Fallback to memory store
    const { trackSearch } = await import('./memory-store');
    await trackSearch(userId, searchData);
  }
} 