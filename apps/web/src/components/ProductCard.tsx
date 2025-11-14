'use client';

import type { Product } from '@meili-demo/shared';

interface ProductCardProps {
  product: Partial<Product> & { _rankingScore?: number };
  showRankingScore?: boolean;
  onMoreLikeThis?: (productId: string) => void;
}

export default function ProductCard({ product, showRankingScore, onMoreLikeThis }: ProductCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
          {showRankingScore && product._rankingScore !== undefined && (
            <span className="badge badge-blue ml-2 shrink-0">
              {product._rankingScore.toFixed(3)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>

        <div className="flex flex-wrap gap-2">
          {product.brand && (
            <span className="badge badge-gray">{product.brand}</span>
          )}
          {product.categories?.slice(0, 2).map((cat) => (
            <span key={cat} className="badge badge-blue">
              {cat}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="badge badge-yellow text-xs">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary-600">
              ${product.price?.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center">
                ⭐ {product.rating?.toFixed(1)}
              </span>
              {product.in_stock ? (
                <span className="badge badge-green">In Stock</span>
              ) : (
                <span className="badge badge-red">Out of Stock</span>
              )}
            </div>
          </div>

          {onMoreLikeThis && product.id && (
            <button
              onClick={() => onMoreLikeThis(product.id!)}
              className="btn btn-outline text-sm"
            >
              Similar
            </button>
          )}
        </div>

        {product.color && (
          <div className="text-sm text-gray-600">
            Color: <span className="font-medium">{product.color}</span>
          </div>
        )}
      </div>
    </div>
  );
}
