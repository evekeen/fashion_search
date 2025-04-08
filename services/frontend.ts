// Frontend-specific interfaces - these should be imported from types
import {
  SearchResult,
  SearchResponse,
  SearchRequest,
  Style,
  Item,
  StyleResponse,
  UserAttributes,
  UserInput
} from '../types/api';

// Re-export types from the types directory for convenience
export type {
  SearchResult,
  SearchResponse,
  SearchRequest,
  Style,
  Item,
  StyleResponse,
  UserAttributes,
  UserInput
};

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