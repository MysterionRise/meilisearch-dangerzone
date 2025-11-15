import {
  buildGeoFilter,
  buildPriceFilter,
  buildRatingFilter,
  combineFilters,
} from './meili';

describe('Meilisearch Helper Functions', () => {
  describe('buildGeoFilter', () => {
    it('should build correct geo filter string', () => {
      const filter = buildGeoFilter(48.8566, 2.3522, 5000);
      expect(filter).toBe('_geoRadius(48.8566, 2.3522, 5000)');
    });

    it('should handle negative coordinates', () => {
      const filter = buildGeoFilter(-33.8688, 151.2093, 2000);
      expect(filter).toBe('_geoRadius(-33.8688, 151.2093, 2000)');
    });

    it('should handle zero radius', () => {
      const filter = buildGeoFilter(0, 0, 0);
      expect(filter).toBe('_geoRadius(0, 0, 0)');
    });
  });

  describe('buildPriceFilter', () => {
    it('should build range filter with min and max', () => {
      const filter = buildPriceFilter(10, 100);
      expect(filter).toBe('price 10 TO 100');
    });

    it('should build min-only filter', () => {
      const filter = buildPriceFilter(50, undefined);
      expect(filter).toBe('price >= 50');
    });

    it('should build max-only filter', () => {
      const filter = buildPriceFilter(undefined, 200);
      expect(filter).toBe('price <= 200');
    });

    it('should return null when no bounds specified', () => {
      const filter = buildPriceFilter(undefined, undefined);
      expect(filter).toBeNull();
    });

    it('should handle zero values', () => {
      const filter = buildPriceFilter(0, 0);
      expect(filter).toBe('price 0 TO 0');
    });
  });

  describe('buildRatingFilter', () => {
    it('should build rating filter', () => {
      const filter = buildRatingFilter(4.5);
      expect(filter).toBe('rating >= 4.5');
    });

    it('should handle zero rating', () => {
      const filter = buildRatingFilter(0);
      expect(filter).toBe('rating >= 0');
    });

    it('should return null when undefined', () => {
      const filter = buildRatingFilter(undefined);
      expect(filter).toBeNull();
    });
  });

  describe('combineFilters', () => {
    it('should combine multiple filters with AND', () => {
      const filters = ['price >= 10', 'rating >= 4', 'in_stock = true'];
      const result = combineFilters(filters);
      expect(result).toBe('price >= 10 AND rating >= 4 AND in_stock = true');
    });

    it('should filter out null values', () => {
      const filters = ['price >= 10', null, 'rating >= 4', null];
      const result = combineFilters(filters);
      expect(result).toBe('price >= 10 AND rating >= 4');
    });

    it('should filter out empty strings', () => {
      const filters = ['price >= 10', '', 'rating >= 4'];
      const result = combineFilters(filters);
      expect(result).toBe('price >= 10 AND rating >= 4');
    });

    it('should return undefined for empty array', () => {
      const result = combineFilters([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for all-null array', () => {
      const result = combineFilters([null, null, null]);
      expect(result).toBeUndefined();
    });

    it('should handle single filter', () => {
      const result = combineFilters(['price >= 10']);
      expect(result).toBe('price >= 10');
    });
  });

  describe('Filter combinations', () => {
    it('should build complex filter from multiple sources', () => {
      const priceFilter = buildPriceFilter(50, 200);
      const ratingFilter = buildRatingFilter(4);
      const geoFilter = buildGeoFilter(48.8566, 2.3522, 5000);
      const stockFilter = 'in_stock = true';

      const combined = combineFilters([
        priceFilter,
        ratingFilter,
        geoFilter,
        stockFilter,
      ]);

      expect(combined).toBe(
        'price 50 TO 200 AND rating >= 4 AND _geoRadius(48.8566, 2.3522, 5000) AND in_stock = true'
      );
    });

    it('should handle partial filter combination', () => {
      const priceFilter = buildPriceFilter(undefined, undefined);
      const ratingFilter = buildRatingFilter(3.5);
      const stockFilter = 'in_stock = true';

      const combined = combineFilters([
        priceFilter,
        ratingFilter,
        stockFilter,
      ]);

      expect(combined).toBe('rating >= 3.5 AND in_stock = true');
    });
  });
});
