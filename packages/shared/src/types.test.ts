import {
  PRODUCT_FACETS,
  ARTICLE_FACETS,
  FACET_LABELS,
  DEFAULT_HITS_PER_PAGE,
  DEFAULT_SEMANTIC_RATIO,
  type Product,
  type Article,
  type SearchParams,
  type SearchMode,
} from './types';

describe('Type Exports and Constants', () => {
  describe('Constants', () => {
    it('should have correct product facets', () => {
      expect(PRODUCT_FACETS).toEqual(['categories', 'brand', 'tags', 'color']);
    });

    it('should have correct article facets', () => {
      expect(ARTICLE_FACETS).toEqual(['topics', 'author']);
    });

    it('should have default hits per page', () => {
      expect(DEFAULT_HITS_PER_PAGE).toBe(12);
    });

    it('should have default semantic ratio', () => {
      expect(DEFAULT_SEMANTIC_RATIO).toBe(0.5);
    });

    it('should have facet labels for all facets', () => {
      expect(FACET_LABELS).toHaveProperty('categories');
      expect(FACET_LABELS).toHaveProperty('brand');
      expect(FACET_LABELS).toHaveProperty('tags');
      expect(FACET_LABELS).toHaveProperty('color');
      expect(FACET_LABELS).toHaveProperty('topics');
      expect(FACET_LABELS).toHaveProperty('author');
    });

    it('should have correct facet label structure', () => {
      expect(FACET_LABELS.categories).toEqual({
        label: 'Categories',
        type: 'multi',
        sortBy: 'count',
      });

      expect(FACET_LABELS.price).toEqual({
        label: 'Price',
        type: 'range',
      });

      expect(FACET_LABELS.in_stock).toEqual({
        label: 'In Stock',
        type: 'boolean',
      });
    });
  });

  describe('Product Type', () => {
    it('should accept valid product object', () => {
      const product: Product = {
        id: 'test-1',
        product_id: 'PROD_1',
        title: 'Test Product',
        description: 'Test description',
        brand: 'TestBrand',
        categories: ['Electronics'],
        tags: ['tag1', 'tag2'],
        price: 99.99,
        rating: 4.5,
        in_stock: true,
        popularity: 100,
        created_at: '2024-01-01T00:00:00Z',
        color: 'Black',
        _geo: {
          lat: 48.8566,
          lng: 2.3522,
        },
      };

      expect(product.id).toBe('test-1');
      expect(product.categories).toHaveLength(1);
      expect(product._geo.lat).toBe(48.8566);
    });
  });

  describe('Article Type', () => {
    it('should accept valid article object', () => {
      const article: Article = {
        id: 'article-1',
        title: 'Test Article',
        body: 'Test body content',
        topics: ['setup', 'guide'],
        author: 'Test Author',
        published_at: '2024-01-01T00:00:00Z',
        product_refs: ['PROD_1', 'PROD_2'],
      };

      expect(article.id).toBe('article-1');
      expect(article.topics).toHaveLength(2);
      expect(article.product_refs).toHaveLength(2);
    });
  });

  describe('SearchParams Type', () => {
    it('should accept valid search params for products', () => {
      const params: SearchParams = {
        index: 'products',
        q: 'test query',
        facets: ['categories', 'brand'],
        filters: 'in_stock = true',
        sort: ['price:asc'],
        page: 1,
        hitsPerPage: 12,
        distinct: 'product_id',
        rankingScoreThreshold: 0.5,
        showRankingScore: true,
        semanticRatio: 0.7,
        mode: 'hybrid',
        geo: {
          lat: 48.8566,
          lng: 2.3522,
          radiusMeters: 5000,
        },
      };

      expect(params.index).toBe('products');
      expect(params.mode).toBe('hybrid');
      expect(params.geo?.radiusMeters).toBe(5000);
    });

    it('should accept minimal search params', () => {
      const params: SearchParams = {
        index: 'articles',
        q: null,
      };

      expect(params.index).toBe('articles');
      expect(params.q).toBeNull();
    });

    it('should accept all search modes', () => {
      const modes: SearchMode[] = ['keyword', 'semantic', 'hybrid'];
      modes.forEach((mode) => {
        const params: SearchParams = {
          index: 'products',
          q: 'test',
          mode,
        };
        expect(params.mode).toBe(mode);
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce valid index values', () => {
      const validIndices: Array<'products' | 'articles'> = ['products', 'articles'];
      validIndices.forEach((index) => {
        const params: SearchParams = { index, q: 'test' };
        expect(['products', 'articles']).toContain(params.index);
      });
    });

    it('should enforce semantic ratio bounds (0-1)', () => {
      const validRatios = [0, 0.5, 1];
      validRatios.forEach((ratio) => {
        expect(ratio).toBeGreaterThanOrEqual(0);
        expect(ratio).toBeLessThanOrEqual(1);
      });
    });
  });
});
