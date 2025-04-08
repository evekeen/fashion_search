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

export interface UserAttributes {
  gender_presentation?: string;
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