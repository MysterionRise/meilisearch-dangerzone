'use client';

import type { Article } from '@meili-demo/shared';

interface ArticleCardProps {
  article: Partial<Article> & { _rankingScore?: number };
  showRankingScore?: boolean;
  onMoreLikeThis?: (articleId: string) => void;
}

export default function ArticleCard({ article, showRankingScore, onMoreLikeThis }: ArticleCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
          {showRankingScore && article._rankingScore !== undefined && (
            <span className="badge badge-blue ml-2 shrink-0">
              {article._rankingScore.toFixed(3)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-4">{article.body}</p>

        <div className="flex flex-wrap gap-2">
          {article.topics?.slice(0, 4).map((topic) => (
            <span key={topic} className="badge badge-blue">
              {topic}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm text-gray-600">
          <div>
            By <span className="font-medium">{article.author}</span>
          </div>
          {article.published_at && (
            <div>
              {new Date(article.published_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {onMoreLikeThis && article.id && (
          <button
            onClick={() => onMoreLikeThis(article.id!)}
            className="btn btn-outline text-sm w-full"
          >
            Similar Articles
          </button>
        )}
      </div>
    </div>
  );
}
