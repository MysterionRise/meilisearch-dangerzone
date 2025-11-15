import { NextRequest, NextResponse } from 'next/server';
import { getMeiliClient } from '@/lib/meili-server';
import type { MultiSearchParams } from '@meili-demo/shared';

export async function POST(request: NextRequest) {
  try {
    const body: MultiSearchParams = await request.json();
    const { queries, federation } = body;

    const client = getMeiliClient();

    const searchParams: any = {
      queries: queries.map((query) => ({
        indexUid: query.indexUid,
        q: query.q || '',
        filter: query.filter,
        facets: query.facets,
        sort: query.sort,
        hitsPerPage: query.hitsPerPage || 12,
        page: query.page || 1,
        hybrid: query.hybrid,
      })),
    };

    if (federation) {
      searchParams.federation = federation;
    }

    const results = await client.multiSearch(searchParams);

    return NextResponse.json({
      results: results.results,
    });
  } catch (error: any) {
    console.error('Multi-search error:', error);
    return NextResponse.json(
      { error: error.message || 'Multi-search failed' },
      { status: 500 }
    );
  }
}
