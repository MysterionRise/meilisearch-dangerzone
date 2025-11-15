'use client';

import type { SearchMode } from '@meili-demo/shared';

interface ModeSelectorProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange('keyword')}
        className={`btn ${mode === 'keyword' ? 'btn-primary' : 'btn-outline'}`}
      >
        Keyword
      </button>
      <button
        onClick={() => onChange('hybrid')}
        className={`btn ${mode === 'hybrid' ? 'btn-primary' : 'btn-outline'}`}
      >
        Hybrid
      </button>
      <button
        onClick={() => onChange('semantic')}
        className={`btn ${mode === 'semantic' ? 'btn-primary' : 'btn-outline'}`}
      >
        Semantic
      </button>
    </div>
  );
}
