// Frontend-specific interfaces
export interface SearchResult {
  description: string;
  price: string;
  thumbnailURL: string;
  productURL: string;
  rating?: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchRequest {
  query: string;
}

// For recommendation components
export interface Recommendation {
  title: string;
  link: string;
  source: string;
  price: string;
  thumbnail: string;
  rating?: number;
  reviews?: number;
  extensions: string[];
}

export interface RecommendationResultsProps {
  recommendations: Recommendation[];
}