# Meilisearch Hybrid Search Demo

A comprehensive, client-ready demonstration of Meilisearch's hybrid search capabilities, combining keyword search with semantic vector search using OpenAI embeddings.

## Features

### Search Capabilities

- **🔍 Keyword Search**: Traditional full-text search with typo tolerance and synonyms
- **🧠 Semantic Search**: AI-powered vector search using OpenAI embeddings (text-embedding-3-small)
- **⚡ Hybrid Search**: Combine both approaches with an adjustable semantic ratio (0-1)
- **🎯 Similar Items**: Find related products/articles using vector similarity
- **🌍 Multi-Search**: Federated search across multiple indexes

### Advanced Features

- **Faceted Search**: Real-time facet filtering with counts
- **Geo-Location**: Filter and sort by proximity with `_geoRadius` and `_geoPoint`
- **Search-Time Grouping**: Group product variants using `distinct` parameter
- **Ranking Score**: Visualize and filter by `_rankingScore` with adjustable thresholds
- **Typo Tolerance**: Configurable typo tolerance with synonym support
- **Sorting**: Multiple sort options including price, rating, date, and geo-proximity

### Data

- **10,000+ Products**: Across 10 categories with realistic attributes
- **800+ Articles**: Help articles covering setup, troubleshooting, and more
- **100 Brands**: Diverse product brands
- **Geo Data**: Products distributed across major world cities

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Search**: Meilisearch latest (≥1.13)
- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
- **Package Manager**: PNPM with workspaces
- **Infrastructure**: Docker Compose

## Prerequisites

- Node.js 20+
- PNPM 8+
- Docker & Docker Compose
- OpenAI API Key (for vector embeddings)

## Quick Start

### 1. Start Meilisearch

```bash
cd infra
cp .env.example .env
# Edit .env and set your MEILI_MASTER_KEY
docker compose up -d
```

Verify Meilisearch is running at http://localhost:7700

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

You need to configure environment variables in **two locations**:

**A. Root `.env` (for bootstrap/seed scripts):**

```bash
cp .env.example .env
```

**B. `apps/web/.env.local` (for Next.js app):**

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit **both files** and add your OpenAI API key:

```env
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=dev-master-key
OPENAI_API_KEY=sk-your-openai-api-key-here  # Replace with your actual key
```

> **Note**: The OPENAI_API_KEY is optional. Without it, only text search will work (vector/hybrid search will be disabled).

### 4. Bootstrap Indexes

Configure Meilisearch indexes, embedders, settings, synonyms, and typo tolerance:

```bash
pnpm bootstrap        # Safe mode: preserves existing data
pnpm bootstrap:clean  # Clean mode: deletes existing indices first
```

This will:
- Create `products` and `articles` indexes
- Configure OpenAI embedders with document templates
- Set up searchable, filterable, and sortable attributes
- Configure faceting and pagination
- Add synonyms (e.g., "cellphone" ↔ "smartphone")
- Configure typo tolerance

> **Note**: Use `bootstrap:clean` to completely reset indices during development. The default `bootstrap` command is safe and preserves existing data.

### 5. Seed Data

Generate and index synthetic data:

```bash
pnpm seed
```

This will:
- Generate 10,000 products with realistic attributes
- Generate 800 articles with topics and content
- Index documents in batches of 1,000
- Wait for all indexing tasks to complete

**Note**: Embedding generation may take 5-15 minutes depending on OpenAI API rate limits.

### 6. Check Indexing Status

Monitor indexing progress:

```bash
pnpm check:tasks
```

Wait until all tasks show "succeeded" status.

### 7. Start Development Server

```bash
pnpm dev
```

Open http://localhost:3000

## Project Structure

```
meilisearch-dangerzone/
├── infra/                      # Infrastructure
│   ├── docker-compose.yml      # Meilisearch container
│   └── .env.example            # Environment template
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── page.tsx    # Landing page
│       │   │   ├── search/     # Search page with tabs
│       │   │   └── api/        # API routes
│       │   │       ├── search/
│       │   │       ├── facet-search/
│       │   │       ├── similar/
│       │   │       └── multi-search/
│       │   ├── components/     # React components
│       │   │   ├── SearchBox.tsx
│       │   │   ├── ModeSelector.tsx
│       │   │   ├── SemanticSlider.tsx
│       │   │   ├── FacetPanel.tsx
│       │   │   ├── Filters.tsx
│       │   │   ├── GeoFilter.tsx
│       │   │   ├── SortPicker.tsx
│       │   │   ├── ProductCard.tsx
│       │   │   ├── ArticleCard.tsx
│       │   │   ├── SimilarDrawer.tsx
│       │   │   └── Pagination.tsx
│       │   └── lib/
│       │       └── meili-server.ts
│       └── package.json
├── packages/
│   └── shared/                 # Shared utilities
│       ├── src/
│       │   ├── types.ts        # TypeScript types
│       │   ├── meili.ts        # Meilisearch helpers
│       │   └── index.ts
│       └── package.json
├── scripts/                    # Utility scripts
│   ├── bootstrap.ts            # Index configuration
│   ├── seed-products.ts        # Product data generation
│   ├── seed-articles.ts        # Article data generation
│   └── check-tasks.ts          # Task monitoring
├── package.json                # Root package
├── pnpm-workspace.yaml         # PNPM workspace config
└── README.md
```

## Usage Guide

### Search Modes

**Keyword Mode** (`semanticRatio: 0`)
- Pure keyword-based search
- Uses BM25 ranking
- Best for exact matches and specific terms

**Semantic Mode** (`semanticRatio: 1`)
- Pure vector-based search
- Understands meaning and context
- Best for conceptual queries

**Hybrid Mode** (`semanticRatio: 0-1`)
- Combines both approaches
- Adjustable via slider
- Recommended: 0.5 for balanced results

### Hybrid Search Examples

Try these queries to see hybrid search in action:

1. **"wireless earbuds"** vs **"bluetooth in-ear headphones"**
   - Keyword mode: Different results
   - Semantic mode: Similar results (understands synonyms)

2. **"noise canceling headphones"** (with typo)
   - Typo tolerance fixes "canceling" → "cancelling"

3. **"laptop for coding"**
   - Semantic search understands "coding" relates to development

### Faceted Search

- Select multiple values within facets (OR logic)
- Multiple facets combine with AND logic
- Real-time facet counts update with query

### Geo-Location Search

1. Click "Use My Location" or manually enter coordinates
2. Set radius in kilometers
3. Results filtered within radius
4. Sort by proximity using geo-point sort

### Product Variant Grouping

Enable "Group Variants" to use search-time `distinct` on `product_id`:
- Collapses product variants into single results
- Useful for color/size variations

### Ranking Score

Enable "Show Scores" to:
- Display `_rankingScore` (0-1) on each result
- Understand relevance calculations
- Set threshold to filter low-confidence results

### Similar Items

Click "Similar" on any product/article:
- Uses `/similar` endpoint
- Finds semantically similar items
- Powered by vector embeddings

## API Routes

### POST /api/search

Search a single index with full control.

**Request:**

```json
{
  "index": "products",
  "q": "wireless headphones",
  "facets": ["categories", "brand"],
  "filters": "in_stock = true AND price 50 TO 200",
  "sort": ["price:asc"],
  "page": 1,
  "hitsPerPage": 12,
  "distinct": "product_id",
  "rankingScoreThreshold": 0.2,
  "showRankingScore": true,
  "mode": "hybrid",
  "semanticRatio": 0.7,
  "geo": {
    "lat": 48.8566,
    "lng": 2.3522,
    "radiusMeters": 5000
  }
}
```

**Response:**

```json
{
  "hits": [...],
  "facetDistribution": {...},
  "facetStats": {...},
  "processingTimeMs": 12,
  "estimatedTotalHits": 156,
  "page": 1,
  "totalPages": 13
}
```

### POST /api/facet-search

Search within facet values (for autocomplete).

**Request:**

```json
{
  "index": "products",
  "facetName": "brand",
  "facetQuery": "tech",
  "q": "headphones"
}
```

### POST /api/similar

Find similar documents using vector similarity.

**Request:**

```json
{
  "index": "products",
  "id": "product_123",
  "limit": 6,
  "rankingScoreThreshold": 0.5
}
```

### POST /api/multi-search

Federated search across multiple indexes.

**Request:**

```json
{
  "queries": [
    {
      "indexUid": "products",
      "q": "wireless",
      "hitsPerPage": 6
    },
    {
      "indexUid": "articles",
      "q": "wireless",
      "hitsPerPage": 6
    }
  ]
}
```

## Configuration

### Index Settings

**Products Index:**
- **Searchable**: title, description, brand, categories, tags
- **Filterable**: categories, brand, tags, price, rating, in_stock, _geo, color, created_at, product_id
- **Sortable**: price, rating, popularity, created_at, _geo
- **Ranking Rules**: words, typo, proximity, attribute, sort, exactness, popularity:desc, rating:desc
- **Distinct**: product_id (search-time)

**Articles Index:**
- **Searchable**: title, body, topics
- **Filterable**: topics, author, published_at, product_refs
- **Sortable**: published_at
- **Ranking Rules**: words, typo, proximity, attribute, sort, exactness

### Embedders

Both indexes use OpenAI `text-embedding-3-small` (1536 dimensions):

**Products Template:**
```
title: {{doc.title}}
{{doc.description}}
brand: {{doc.brand}}
categories: {{doc.categories}}
tags: {{doc.tags}}
```

**Articles Template:**
```
{{doc.title}}

{{doc.body}}

Topics: {{doc.topics}}
```

### Synonyms

**Products:**
- cellphone ↔ smartphone, mobile phone
- sneakers ↔ trainers, running shoes
- hoodie ↔ hooded sweatshirt
- laptop ↔ notebook
- earbuds ↔ in-ear headphones

**Articles:**
- return ↔ refund, send back
- warranty ↔ guarantee
- shipping ↔ delivery

## Performance

- **Search latency**: 10-50ms (depending on query complexity)
- **Indexing**: ~1,000 docs/sec
- **Embedding generation**: Rate-limited by OpenAI API
- **Typo tolerance**: Minimal overhead
- **Geo filtering**: Efficient with proper radius

## Troubleshooting

### Embeddings not generated

```bash
# Check tasks
pnpm check:tasks

# Look for failed tasks
# Common causes:
# - Invalid OPENAI_API_KEY
# - API rate limits
# - Network issues
```

### Re-bootstrap indexes

```bash
# Delete and recreate
curl -X DELETE 'http://localhost:7700/indexes/products' \
  -H 'Authorization: Bearer dev-master-key'

curl -X DELETE 'http://localhost:7700/indexes/articles' \
  -H 'Authorization: Bearer dev-master-key'

pnpm bootstrap
pnpm seed
```

### Reset everything

```bash
cd infra
docker compose down -v
docker compose up -d
cd ..
pnpm bootstrap
pnpm seed
```

## Development

### Type Checking

```bash
pnpm type-check
```

### Building

```bash
pnpm build
```

### Testing

The project includes comprehensive tests to ensure reliability:

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run tests with coverage
pnpm --filter @meili-demo/shared test:coverage

# Run tests in watch mode
pnpm --filter @meili-demo/shared test:watch
```

**Test Coverage:**

- **Unit Tests** (`packages/shared/src/*.test.ts`)
  - Filter building functions (`buildGeoFilter`, `buildPriceFilter`, etc.)
  - Type definitions and constants
  - Utility functions

- **Integration Tests** (`apps/web/src/__tests__/integration/*.test.ts`)
  - API route parameter validation
  - Search mode logic
  - Filter combinations
  - Pagination calculations
  - Response structure validation

- **Smoke Tests** (`scripts/__tests__/*.test.ts`)
  - Bootstrap configuration
  - Seed data structure
  - Environment variable checks
  - Data generation validation

**CI/CD:**

GitHub Actions automatically runs on every push:
- Type checking across all packages
- Unit and integration tests
- Next.js build verification
- Integration tests with Meilisearch service

See `.github/workflows/ci.yml` for the full CI configuration.

### Environment Variables

**Required:**
- `MEILI_HOST`: Meilisearch instance URL
- `MEILI_MASTER_KEY`: Master key for admin operations
- `OPENAI_API_KEY`: OpenAI API key for embeddings

**Optional:**
- `NODE_ENV`: development | production

## Security

- **Never expose MEILI_MASTER_KEY to the client**
- All search operations go through Next.js API routes
- Consider creating a restricted search-only API key for production
- Use tenant tokens for multi-tenant applications

## Acceptance Criteria

- [x] Hybrid control works: changing semanticRatio (0-1) changes ordering
- [x] Three modes: Keyword-only, Semantic-only, Hybrid
- [x] Facets appear with counts; facet search works
- [x] Geo radius filter returns/sorts nearby results
- [x] "Group variants" toggles search-time `distinct`
- [x] Ranking score badge visible when toggled
- [x] `rankingScoreThreshold` trims results
- [x] "More like this" returns similar items
- [x] Multi-search tab queries both indexes
- [x] Synonyms and typo tolerance demonstrably affect results
- [x] Code is typed, documented, and easy to run

## License

MIT

## Resources

- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [Meilisearch Hybrid Search](https://www.meilisearch.com/docs/learn/experimental/vector_search)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Next.js 14 Documentation](https://nextjs.org/docs)