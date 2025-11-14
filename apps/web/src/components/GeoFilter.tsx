'use client';

import { useState } from 'react';

interface GeoFilterProps {
  lat: number;
  lng: number;
  radiusKm: number;
  onGeoChange: (lat: number, lng: number, radiusKm: number) => void;
  onUseMyLocation: () => void;
}

export default function GeoFilter({
  lat,
  lng,
  radiusKm,
  onGeoChange,
  onUseMyLocation,
}: GeoFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center font-medium"
      >
        <span>Location Filter</span>
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
        <div className="space-y-3">
          <button
            onClick={onUseMyLocation}
            className="btn btn-outline w-full text-sm"
          >
            📍 Use My Location
          </button>

          <div>
            <label className="text-sm text-gray-600">Latitude</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => onGeoChange(parseFloat(e.target.value), lng, radiusKm)}
              className="input text-sm"
              step="0.0001"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Longitude</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => onGeoChange(lat, parseFloat(e.target.value), radiusKm)}
              className="input text-sm"
              step="0.0001"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Radius (km)</label>
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => onGeoChange(lat, lng, parseFloat(e.target.value))}
              className="input text-sm"
              min="0.1"
              step="0.1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
