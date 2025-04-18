// API types for the fashion search application

// Search-related types
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

// Generic API response types
export interface ApiErrorResponse {
  error: string;
  success?: boolean;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

// Style-related types
export interface Style {
  title: string;
  description: string;
  tags: string[];
}

export interface Item {
  short_description: string;
  description: string;
  category: string;
}

export interface StyleResponse {
  style: Style;
  items: Item[];
  gender: string;
}

// User-related types
export interface UserAttributes {
  gender?: string;
  apparent_age_range?: string;
  body_type?: string;
  height_impression?: string;
  skin_tone?: string;
  style_suggestions?: string[];
  colors_to_complement?: string[];
  avoid_styles?: string[];
}

export interface UserInput {
  additional_info: string;
  budget: string;
  profile_photo_path?: string;
  aesthetic_photo_paths?: string[];
}