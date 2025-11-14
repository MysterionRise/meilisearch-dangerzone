import { NextRequest, NextResponse } from 'next/server';
import { getMeiliClient } from '@/lib/meili-server';
import type { SimilarParams } from '@meili-demo/shared';

export async function POST(request: NextRequest) {
  try {
    const body: SimilarParams = await request.json();
    const { index, id, limit = 6, rankingScoreThreshold } = body;

    const client = getMeiliClient();
    const meiliIndex = client.index(index);

    const searchParams: any = {
      id,
      embedder: 'openai',
      limit,
    };

    if (rankingScoreThreshold !== undefined) {
      searchParams.rankingScoreThreshold = rankingScoreThreshold;
    }

    // Show ranking scores for similar items
    searchParams.showRankingScore = true;

    const results = await meiliIndex.searchSimilarDocuments(searchParams);

    return NextResponse.json({
      hits: results.hits,
      id: results.id,
      processingTimeMs: results.processingTimeMs,
      limit: results.limit,
    });
  } catch (error: any) {
    console.error('Similar search error:', error);
    return NextResponse.json(
      { error: error.message || 'Similar search failed' },
      { status: 500 }
    );
  }
}
