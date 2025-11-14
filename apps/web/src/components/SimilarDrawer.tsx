'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import ArticleCard from './ArticleCard';
import type { Product, Article } from '@meili-demo/shared';

interface SimilarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  index: 'products' | 'articles';
}

export default function SimilarDrawer({ isOpen, onClose, itemId, index }: SimilarDrawerProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !itemId) {
      setItems([]);
      setError(null);
      return;
    }

    const fetchSimilar = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index, id: itemId, limit: 6 }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch similar items');
        }

        const data = await response.json();
        setItems(data.hits || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [isOpen, itemId, index]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Similar Items</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Finding similar items...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              No similar items found.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) =>
                index === 'products' ? (
                  <ProductCard key={item.id} product={item} showRankingScore />
                ) : (
                  <ArticleCard key={item.id} article={item} showRankingScore />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
