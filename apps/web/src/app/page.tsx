import Link from 'next/link';

export default function HomePage() {
  const presets = [
    {
      title: 'Wireless Audio',
      description: 'Search for headphones, earbuds, and speakers',
      query: 'wireless headphones',
      index: 'products',
    },
    {
      title: 'Smart Devices',
      description: 'Explore smart watches and fitness trackers',
      query: 'smart watch',
      index: 'products',
    },
    {
      title: 'Gaming Gear',
      description: 'Find gaming mice, keyboards, and accessories',
      query: 'gaming',
      index: 'products',
    },
    {
      title: 'Setup Guides',
      description: 'Learn how to set up your new products',
      query: 'setup',
      index: 'articles',
    },
    {
      title: 'Troubleshooting',
      description: 'Find solutions to common issues',
      query: 'troubleshooting',
      index: 'articles',
    },
    {
      title: 'Sustainability',
      description: 'Read about our eco-friendly practices',
      query: 'sustainability',
      index: 'articles',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Meilisearch Hybrid Search
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of hybrid search combining keyword and semantic search
            with vector embeddings
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-lg mb-2">Keyword Search</h3>
            <p className="text-sm text-gray-600">
              Traditional full-text search with typo tolerance and synonyms
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="font-semibold text-lg mb-2">Semantic Search</h3>
            <p className="text-sm text-gray-600">
              AI-powered vector search using OpenAI embeddings
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Hybrid Mode</h3>
            <p className="text-sm text-gray-600">
              Combine both approaches with adjustable semantic ratio
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Try These Searches</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Link
                key={preset.title}
                href={`/search?q=${encodeURIComponent(preset.query)}&tab=${preset.index}`}
                className="card hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <h3 className="font-semibold text-lg mb-2">{preset.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                <div className="text-primary-600 text-sm font-medium">
                  Search "{preset.query}" →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/search" className="btn btn-primary text-lg px-8 py-3">
            Start Exploring
          </Link>
        </div>

        {/* Info */}
        <div className="mt-16 card bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-lg mb-3">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2">
              <li>✅ 10,000+ synthetic products</li>
              <li>✅ 800+ help articles</li>
              <li>✅ Real-time faceted search</li>
              <li>✅ Geo-location filtering</li>
            </ul>
            <ul className="space-y-2">
              <li>✅ Adjustable semantic ratio</li>
              <li>✅ Similarity search</li>
              <li>✅ Multi-index federation</li>
              <li>✅ Ranking score visibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
