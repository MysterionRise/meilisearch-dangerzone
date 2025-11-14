import { NextRequest, NextResponse } from 'next/server';
import { getMeiliClient } from '@/lib/meili-server';
import type { SearchParams } from '@meili-demo/shared';

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json();
    const {
      index,
      q,
      facets,
      filters,
      sort,
      page = 1,
      hitsPerPage = 12,
      distinct,
      rankingScoreThreshold,
      showRankingScore = false,
      semanticRatio = 0.5,
      mode = 'hybrid',
      geo,
    } = body;

    const client = getMeiliClient();
    const meiliIndex = client.index(index);

    // Build search request
    const searchParams: any = {
      limit: hitsPerPage,
      offset: (page - 1) * hitsPerPage,
    };

    // Query (null for placeholder search)
    if (q !== null && q !== undefined) {
      searchParams.q = q;
    }

    // Facets
    if (facets && facets.length > 0) {
      searchParams.facets = facets;
    }

    // Filters
    const filterArray: string[] = [];

    if (filters) {
      if (typeof filters === 'string') {
        filterArray.push(filters);
      } else {
        // Handle array format
        filterArray.push(...filters.flat());
      }
    }

    // Geo filter
    if (geo) {
      const geoFilter = `_geoRadius(${geo.lat}, ${geo.lng}, ${geo.radiusMeters})`;
      filterArray.push(geoFilter);
    }

    if (filterArray.length > 0) {
      searchParams.filter = filterArray.join(' AND ');
    }

    // Sort
    if (sort && sort.length > 0) {
      searchParams.sort = sort;
    }

    // Distinct (search-time grouping)
    if (distinct) {
      searchParams.distinct = distinct;
    }

    // Ranking score
    if (showRankingScore) {
      searchParams.showRankingScore = true;
    }

    if (rankingScoreThreshold !== undefined) {
      searchParams.rankingScoreThreshold = rankingScoreThreshold;
    }

    // Hybrid search configuration
    if (mode === 'semantic') {
      searchParams.hybrid = {
        semanticRatio: 1.0,
        embedder: 'openai',
      };
    } else if (mode === 'keyword') {
      searchParams.hybrid = {
        semanticRatio: 0.0,
        embedder: 'openai',
      };
    } else if (mode === 'hybrid') {
      searchParams.hybrid = {
        semanticRatio,
        embedder: 'openai',
      };
    }

    // Execute search
    const results = await meiliIndex.search(searchParams.q || '', searchParams);

    // Transform response
    const response = {
      hits: results.hits,
      query: results.query,
      processingTimeMs: results.processingTimeMs,
      limit: results.limit,
      offset: results.offset,
      estimatedTotalHits: results.estimatedTotalHits,
      page,
      hitsPerPage,
      totalHits: results.estimatedTotalHits,
      totalPages: Math.ceil((results.estimatedTotalHits || 0) / hitsPerPage),
      facetDistribution: results.facetDistribution,
      facetStats: results.facetStats,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
