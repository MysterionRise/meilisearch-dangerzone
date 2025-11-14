'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBox from '@/components/SearchBox';
import ModeSelector from '@/components/ModeSelector';
import SemanticSlider from '@/components/SemanticSlider';
import FacetPanel from '@/components/FacetPanel';
import Filters from '@/components/Filters';
import GeoFilter from '@/components/GeoFilter';
import SortPicker from '@/components/SortPicker';
import ProductCard from '@/components/ProductCard';
import ArticleCard from '@/components/ArticleCard';
import SimilarDrawer from '@/components/SimilarDrawer';
import Pagination from '@/components/Pagination';
import type { SearchMode, SearchResponse, Product, Article } from '@meili-demo/shared';
import Link from 'next/link';

type TabType = 'products' | 'articles' | 'all';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialQuery = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as TabType) || 'products';

  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<SearchMode>('hybrid');
  const [semanticRatio, setSemanticRatio] = useState(0.5);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showRankingScore, setShowRankingScore] = useState(false);
  const [rankingScoreThreshold, setRankingScoreThreshold] = useState(0);
  const [useDistinct, setUseDistinct] = useState(false);

  // Products filters
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Geo filter
  const [useGeo, setUseGeo] = useState(false);
  const [geoLat, setGeoLat] = useState(48.8566);
  const [geoLng, setGeoLng] = useState(2.3522);
  const [geoRadiusKm, setGeoRadiusKm] = useState(5);

  // Sort
  const [sort, setSort] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [hitsPerPage] = useState(12);

  // Results
  const [productsResults, setProductsResults] = useState<SearchResponse<Product> | null>(null);
  const [articlesResults, setArticlesResults] = useState<SearchResponse<Article> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Similar drawer
  const [similarDrawer, setSimilarDrawer] = useState<{
    isOpen: boolean;
    itemId: string;
    index: 'products' | 'articles';
  }>({
    isOpen: false,
    itemId: '',
    index: 'products',
  });

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'all') {
        // Multi-search
        const response = await fetch('/api/multi-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queries: [
              {
                indexUid: 'products',
                q: query,
                facets: ['categories', 'brand', 'tags', 'color'],
                hitsPerPage: 6,
                hybrid: {
                  semanticRatio: mode === 'semantic' ? 1 : mode === 'keyword' ? 0 : semanticRatio,
                  embedder: 'openai',
                },
              },
              {
                indexUid: 'articles',
                q: query,
                facets: ['topics', 'author'],
                hitsPerPage: 6,
                hybrid: {
                  semanticRatio: mode === 'semantic' ? 1 : mode === 'keyword' ? 0 : semanticRatio,
                  embedder: 'openai',
                },
              },
            ],
          }),
        });

        const data = await response.json();
        setProductsResults(data.results[0]);
        setArticlesResults(data.results[1]);
      } else {
        // Single index search
        const index = activeTab;
        const facets = index === 'products'
          ? ['categories', 'brand', 'tags', 'color']
          : ['topics', 'author'];

        // Build filters
        const filters: string[] = [];

        // Facet filters
        Object.entries(selectedFacets).forEach(([facetName, values]) => {
          if (values.length > 0) {
            const facetFilter = values.map((v) => `${facetName} = "${v}"`).join(' OR ');
            filters.push(`(${facetFilter})`);
          }
        });

        // Price filter
        if (index === 'products' && (priceRange[0] > 0 || priceRange[1] < 2000)) {
          filters.push(`price ${priceRange[0]} TO ${priceRange[1]}`);
        }

        // Rating filter
        if (index === 'products' && minRating > 0) {
          filters.push(`rating >= ${minRating}`);
        }

        // Stock filter
        if (index === 'products' && inStockOnly) {
          filters.push('in_stock = true');
        }

        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            index,
            q: query || null,
            facets,
            filters: filters.length > 0 ? filters.join(' AND ') : undefined,
            sort,
            page,
            hitsPerPage,
            distinct: useDistinct && index === 'products' ? 'product_id' : undefined,
            rankingScoreThreshold: rankingScoreThreshold > 0 ? rankingScoreThreshold : undefined,
            showRankingScore,
            semanticRatio,
            mode,
            geo: useGeo ? {
              lat: geoLat,
              lng: geoLng,
              radiusMeters: geoRadiusKm * 1000,
            } : undefined,
          }),
        });

        const data = await response.json();

        if (index === 'products') {
          setProductsResults(data);
          setArticlesResults(null);
        } else {
          setArticlesResults(data);
          setProductsResults(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    query,
    mode,
    semanticRatio,
    selectedFacets,
    priceRange,
    minRating,
    inStockOnly,
    useGeo,
    geoLat,
    geoLng,
    geoRadiusKm,
    sort,
    page,
    hitsPerPage,
    useDistinct,
    rankingScoreThreshold,
    showRankingScore,
  ]);

  // Perform search when dependencies change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Update URL when query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (activeTab !== 'products') params.set('tab', activeTab);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [query, activeTab, router]);

  const handleFacetChange = (facetName: string, values: string[]) => {
    setSelectedFacets((prev) => ({
      ...prev,
      [facetName]: values,
    }));
    setPage(1);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLat(position.coords.latitude);
          setGeoLng(position.coords.longitude);
          setUseGeo(true);
        },
        (error) => {
          alert('Unable to get your location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleMoreLikeThis = (itemId: string, index: 'products' | 'articles') => {
    setSimilarDrawer({
      isOpen: true,
      itemId,
      index,
    });
  };

  const currentResults = activeTab === 'products' ? productsResults : articlesResults;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Meilisearch Demo
            </Link>
          </div>

          <SearchBox value={query} onChange={setQuery} placeholder="Search products and articles..." />

          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <ModeSelector mode={mode} onChange={setMode} />

            {mode === 'hybrid' && (
              <div className="w-64">
                <SemanticSlider value={semanticRatio} onChange={setSemanticRatio} />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRankingScore}
                onChange={(e) => setShowRankingScore(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm">Show Scores</span>
            </label>

            {activeTab === 'products' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDistinct}
                  onChange={(e) => setUseDistinct(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">Group Variants</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {(['products', 'articles', 'all'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`py-4 px-2 border-b-2 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          {activeTab !== 'all' && (
            <div className="w-64 shrink-0">
              <div className="sticky top-32 space-y-6">
                {/* Facets */}
                {currentResults?.facetDistribution && (
                  <div className="card">
                    <h2 className="font-bold text-lg mb-4">Filters</h2>
                    <FacetPanel
                      facets={currentResults.facetDistribution}
                      selectedFacets={selectedFacets}
                      onFacetChange={handleFacetChange}
                    />
                  </div>
                )}

                {/* Additional Filters */}
                {activeTab === 'products' && (
                  <div className="card">
                    <Filters
                      priceRange={priceRange}
                      minRating={minRating}
                      inStockOnly={inStockOnly}
                      onPriceChange={setPriceRange}
                      onRatingChange={setMinRating}
                      onStockChange={setInStockOnly}
                    />
                  </div>
                )}

                {/* Geo Filter */}
                {activeTab === 'products' && (
                  <div className="card">
                    <GeoFilter
                      lat={geoLat}
                      lng={geoLng}
                      radiusKm={geoRadiusKm}
                      onGeoChange={(lat, lng, radius) => {
                        setGeoLat(lat);
                        setGeoLng(lng);
                        setGeoRadiusKm(radius);
                        setUseGeo(true);
                      }}
                      onUseMyLocation={handleUseMyLocation}
                    />
                    {useGeo && (
                      <button
                        onClick={() => setUseGeo(false)}
                        className="btn btn-secondary w-full text-sm mt-2"
                      >
                        Clear Location Filter
                      </button>
                    )}
                  </div>
                )}

                {/* Sort */}
                <div className="card">
                  <SortPicker
                    value={sort}
                    onChange={setSort}
                    hasGeo={useGeo}
                    geoPoint={{ lat: geoLat, lng: geoLng }}
                  />
                </div>

                {/* Score Threshold */}
                <div className="card">
                  <div className="space-y-2">
                    <label className="font-medium text-sm">Score Threshold</label>
                    <input
                      type="number"
                      value={rankingScoreThreshold}
                      onChange={(e) => setRankingScoreThreshold(parseFloat(e.target.value))}
                      className="input text-sm"
                      min="0"
                      max="1"
                      step="0.1"
                      placeholder="0.0"
                    />
                    <p className="text-xs text-gray-500">
                      Filter out results below this score
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!loading && !error && activeTab === 'all' && (
              <div className="space-y-8">
                {/* Products Section */}
                {productsResults && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Products ({productsResults.estimatedTotalHits})
                    </h2>
                    {productsResults.processingTimeMs !== undefined && (
                      <p className="text-sm text-gray-600 mb-4">
                        Found in {productsResults.processingTimeMs}ms
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {productsResults.hits.map((product: any) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          showRankingScore={showRankingScore}
                          onMoreLikeThis={(id) => handleMoreLikeThis(id, 'products')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles Section */}
                {articlesResults && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Articles ({articlesResults.estimatedTotalHits})
                    </h2>
                    {articlesResults.processingTimeMs !== undefined && (
                      <p className="text-sm text-gray-600 mb-4">
                        Found in {articlesResults.processingTimeMs}ms
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {articlesResults.hits.map((article: any) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          showRankingScore={showRankingScore}
                          onMoreLikeThis={(id) => handleMoreLikeThis(id, 'articles')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && activeTab !== 'all' && currentResults && (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {currentResults.estimatedTotalHits} results
                      {currentResults.processingTimeMs !== undefined &&
                        ` in ${currentResults.processingTimeMs}ms`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentResults.hits.map((item: any) =>
                    activeTab === 'products' ? (
                      <ProductCard
                        key={item.id}
                        product={item}
                        showRankingScore={showRankingScore}
                        onMoreLikeThis={(id) => handleMoreLikeThis(id, 'products')}
                      />
                    ) : (
                      <ArticleCard
                        key={item.id}
                        article={item}
                        showRankingScore={showRankingScore}
                        onMoreLikeThis={(id) => handleMoreLikeThis(id, 'articles')}
                      />
                    )
                  )}
                </div>

                {currentResults.totalPages && currentResults.totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={currentResults.totalPages}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}

            {!loading && !error && currentResults && currentResults.hits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No results found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Drawer */}
      <SimilarDrawer
        isOpen={similarDrawer.isOpen}
        onClose={() => setSimilarDrawer({ ...similarDrawer, isOpen: false })}
        itemId={similarDrawer.itemId}
        index={similarDrawer.index}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
