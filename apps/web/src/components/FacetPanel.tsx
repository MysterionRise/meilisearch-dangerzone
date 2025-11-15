'use client';

import { useState } from 'react';
import type { FacetDistribution } from '@meili-demo/shared';

interface FacetPanelProps {
  facets: FacetDistribution;
  selectedFacets: Record<string, string[]>;
  onFacetChange: (facetName: string, values: string[]) => void;
}

export default function FacetPanel({ facets, selectedFacets, onFacetChange }: FacetPanelProps) {
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>({
    categories: true,
    brand: true,
  });

  const toggleFacet = (facetName: string) => {
    setExpandedFacets((prev) => ({
      ...prev,
      [facetName]: !prev[facetName],
    }));
  };

  const toggleFacetValue = (facetName: string, value: string) => {
    const current = selectedFacets[facetName] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    onFacetChange(facetName, newValues);
  };

  return (
    <div className="space-y-4">
      {Object.entries(facets).map(([facetName, values]) => {
        const isExpanded = expandedFacets[facetName] ?? false;
        const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
        const displayedEntries = isExpanded ? entries : entries.slice(0, 5);

        return (
          <div key={facetName} className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleFacet(facetName)}
              className="w-full flex justify-between items-center mb-2 text-left font-medium"
            >
              <span className="capitalize">{facetName.replace(/_/g, ' ')}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="space-y-2">
                {displayedEntries.map(([value, count]) => {
                  const isSelected = (selectedFacets[facetName] || []).includes(value);
                  return (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFacetValue(facetName, value)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="flex-1 text-sm">{value}</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </label>
                  );
                })}
                {entries.length > 5 && !isExpanded && (
                  <button
                    onClick={() => toggleFacet(facetName)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Show all ({entries.length})
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
