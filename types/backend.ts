// Backend-specific interfaces
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

// For API response handling
export interface ApiErrorResponse {
  error: string;
  success?: boolean;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}