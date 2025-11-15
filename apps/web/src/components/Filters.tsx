'use client';

import { useState } from 'react';

interface FiltersProps {
  priceRange?: [number, number];
  minRating?: number;
  inStockOnly?: boolean;
  onPriceChange?: (range: [number, number]) => void;
  onRatingChange?: (rating: number) => void;
  onStockChange?: (inStock: boolean) => void;
}

export default function Filters({
  priceRange = [0, 2000],
  minRating = 0,
  inStockOnly = false,
  onPriceChange,
  onRatingChange,
  onStockChange,
}: FiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...localPriceRange] as [number, number];
    newRange[index] = value;
    setLocalPriceRange(newRange);
    onPriceChange?.(newRange);
  };

  return (
    <div className="space-y-6">
      {/* Price Filter */}
      {onPriceChange && (
        <div className="space-y-3">
          <h3 className="font-medium">Price Range</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={localPriceRange[0]}
              onChange={(e) => handlePriceChange(0, parseFloat(e.target.value))}
              className="input text-sm"
              placeholder="Min"
              min="0"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={localPriceRange[1]}
              onChange={(e) => handlePriceChange(1, parseFloat(e.target.value))}
              className="input text-sm"
              placeholder="Max"
              min="0"
            />
          </div>
        </div>
      )}

      {/* Rating Filter */}
      {onRatingChange && (
        <div className="space-y-3">
          <h3 className="font-medium">Minimum Rating</h3>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => onRatingChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <span className="font-medium w-12 text-right">
              {minRating > 0 ? `${minRating}+` : 'Any'}
            </span>
          </div>
        </div>
      )}

      {/* Stock Filter */}
      {onStockChange && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onStockChange(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="font-medium">In Stock Only</span>
          </label>
        </div>
      )}
    </div>
  );
}
