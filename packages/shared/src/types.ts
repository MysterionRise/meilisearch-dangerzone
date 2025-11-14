// Core data models

export interface Product {
  id: string;
  product_id: string; // For grouping variants
  title: string;
  description: string;
  brand: string;
  categories: string[];
  tags: string[];
  price: number;
  rating: number; // 0-5
  in_stock: boolean;
  popularity: number; // 0-10000
  created_at: string; // ISO date
  color: string;
  _geo: {
    lat: number;
    lng: number;
  };
}

export interface Article {
  id: string;
  title: string;
  body: string;
  topics: string[];
  author: string;
  published_at: string; // ISO date
  product_refs: string[]; // product_ids referenced
}

// Search parameters

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

export interface GeoFilter {
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface SearchParams {
  index: 'products' | 'articles';
  q: string | null;
  facets?: string[];
  filters?: string | string[][];
  sort?: string[];
  page?: number;
  hitsPerPage?: number;
  distinct?: string;
  rankingScoreThreshold?: number;
  showRankingScore?: boolean;
  semanticRatio?: number; // 0-1
  mode?: SearchMode;
  geo?: GeoFilter;
}

export interface FacetSearchParams {
  index: 'products' | 'articles';
  facetName: string;
  facetQuery?: string;
  q?: string;
  filter?: string | string[][];
}

export interface SimilarParams {
  index: 'products' | 'articles';
  id: string;
  limit?: number;
  rankingScoreThreshold?: number;
}

export interface MultiSearchQuery {
  indexUid: string;
  q?: string;
  filter?: string | string[][];
  facets?: string[];
  sort?: string[];
  hitsPerPage?: number;
  page?: number;
  semanticRatio?: number;
  hybrid?: {
    semanticRatio: number;
    embedder: string;
  };
}

export interface MultiSearchParams {
  queries: MultiSearchQuery[];
  federation?: {
    facetsByIndex?: Record<string, string[]>;
    mergeFacets?: Record<string, string>;
  };
}

// Search response types

export interface FacetDistribution {
  [facetName: string]: {
    [facetValue: string]: number;
  };
}

export interface FacetStats {
  [facetName: string]: {
    min: number;
    max: number;
  };
}

export interface SearchHit<T = Product | Article> extends Partial<T> {
  _rankingScore?: number;
  _formatted?: Partial<T>;
  _matchesPosition?: any;
}

export interface SearchResponse<T = Product | Article> {
  hits: SearchHit<T>[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
  page?: number;
  hitsPerPage?: number;
  totalHits?: number;
  totalPages?: number;
  facetDistribution?: FacetDistribution;
  facetStats?: FacetStats;
}

export interface FacetMeta {
  label: string;
  type: 'multi' | 'single' | 'range' | 'boolean';
  sortBy?: 'count' | 'alpha';
}

// Configuration constants

export const PRODUCT_FACETS = ['categories', 'brand', 'tags', 'color'] as const;
export const ARTICLE_FACETS = ['topics', 'author'] as const;

export const FACET_LABELS: Record<string, FacetMeta> = {
  categories: { label: 'Categories', type: 'multi', sortBy: 'count' },
  brand: { label: 'Brand', type: 'multi', sortBy: 'count' },
  tags: { label: 'Tags', type: 'multi', sortBy: 'count' },
  color: { label: 'Color', type: 'multi', sortBy: 'alpha' },
  topics: { label: 'Topics', type: 'multi', sortBy: 'count' },
  author: { label: 'Author', type: 'multi', sortBy: 'alpha' },
  in_stock: { label: 'In Stock', type: 'boolean' },
  price: { label: 'Price', type: 'range' },
  rating: { label: 'Rating', type: 'range' },
};

export const DEFAULT_HITS_PER_PAGE = 12;
export const DEFAULT_SEMANTIC_RATIO = 0.5;
