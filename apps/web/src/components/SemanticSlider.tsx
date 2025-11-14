'use client';

interface SemanticSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SemanticSlider({ value, onChange }: SemanticSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Semantic Ratio</span>
        <span className="font-medium">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Keyword (0.0)</span>
        <span>Semantic (1.0)</span>
      </div>
    </div>
  );
}
