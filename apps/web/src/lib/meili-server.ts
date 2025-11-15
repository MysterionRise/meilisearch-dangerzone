import { MeiliSearch } from 'meilisearch';

// Server-side only: Never expose these credentials to the client
export function getMeiliClient(): MeiliSearch {
  const host = process.env.MEILI_HOST || 'http://localhost:7700';
  const apiKey = process.env.MEILI_MASTER_KEY || 'dev-master-key';

  return new MeiliSearch({
    host,
    apiKey,
  });
}
