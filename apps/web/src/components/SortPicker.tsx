'use client';

interface SortPickerProps {
  value: string[];
  onChange: (sort: string[]) => void;
  hasGeo?: boolean;
  geoPoint?: { lat: number; lng: number };
}

export default function SortPicker({ value, onChange, hasGeo, geoPoint }: SortPickerProps) {
  const currentSort = value[0] || 'relevance';

  const handleChange = (sortValue: string) => {
    if (sortValue === 'relevance') {
      onChange([]);
    } else if (sortValue === 'geo' && geoPoint) {
      onChange([`_geoPoint(${geoPoint.lat},${geoPoint.lng}):asc`]);
    } else {
      onChange([sortValue]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-medium text-sm">Sort By</label>
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="input text-sm"
      >
        <option value="relevance">Relevance</option>
        <option value="price:asc">Price: Low to High</option>
        <option value="price:desc">Price: High to Low</option>
        <option value="rating:desc">Rating: High to Low</option>
        <option value="created_at:desc">Newest First</option>
        <option value="popularity:desc">Most Popular</option>
        {hasGeo && geoPoint && <option value="geo">Nearest First</option>}
      </select>
    </div>
  );
}
