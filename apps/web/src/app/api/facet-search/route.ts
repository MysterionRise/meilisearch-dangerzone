import { NextRequest, NextResponse } from 'next/server';
import { getMeiliClient } from '@/lib/meili-server';
import type { FacetSearchParams } from '@meili-demo/shared';

export async function POST(request: NextRequest) {
  try {
    const body: FacetSearchParams = await request.json();
    const { index, facetName, facetQuery, q, filter } = body;

    const client = getMeiliClient();
    const meiliIndex = client.index(index);

    const searchParams: any = {
      facetName,
    };

    if (facetQuery) {
      searchParams.facetQuery = facetQuery;
    }

    if (q) {
      searchParams.q = q;
    }

    if (filter) {
      searchParams.filter = filter;
    }

    const results = await meiliIndex.searchForFacetValues(searchParams);

    return NextResponse.json({
      facetHits: results.facetHits,
      facetQuery: results.facetQuery,
      processingTimeMs: results.processingTimeMs,
    });
  } catch (error: any) {
    console.error('Facet search error:', error);
    return NextResponse.json(
      { error: error.message || 'Facet search failed' },
      { status: 500 }
    );
  }
}
