import { MeiliSearch, type Index } from 'meilisearch';
import type { Product, Article } from './types';

export function createMeiliClient(host: string, apiKey: string): MeiliSearch {
  return new MeiliSearch({
    host,
    apiKey,
  });
}

export async function getProductsIndex(client: MeiliSearch): Promise<Index<Product>> {
  return client.index<Product>('products');
}

export async function getArticlesIndex(client: MeiliSearch): Promise<Index<Article>> {
  return client.index<Article>('articles');
}

// Helper to wait for tasks to complete
export async function waitForTasks(
  client: MeiliSearch,
  taskUids: number[],
  options: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<void> {
  const { timeoutMs = 300000, intervalMs = 1000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const tasks = await Promise.all(
      taskUids.map((uid) => client.getTask(uid))
    );

    const allDone = tasks.every(
      (task) => task.status === 'succeeded' || task.status === 'failed'
    );

    if (allDone) {
      const failed = tasks.filter((task) => task.status === 'failed');
      if (failed.length > 0) {
        console.error('Some tasks failed:', failed);
        throw new Error(`${failed.length} task(s) failed`);
      }
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Timeout waiting for tasks: ${taskUids.join(', ')}`);
}

// Build Meilisearch filter strings
export function buildGeoFilter(lat: number, lng: number, radiusMeters: number): string {
  return `_geoRadius(${lat}, ${lng}, ${radiusMeters})`;
}

export function buildPriceFilter(min?: number, max?: number): string | null {
  if (min !== undefined && max !== undefined) {
    return `price ${min} TO ${max}`;
  } else if (min !== undefined) {
    return `price >= ${min}`;
  } else if (max !== undefined) {
    return `price <= ${max}`;
  }
  return null;
}

export function buildRatingFilter(min?: number): string | null {
  if (min !== undefined) {
    return `rating >= ${min}`;
  }
  return null;
}

export function combineFilters(filters: (string | null)[]): string | undefined {
  const validFilters = filters.filter((f): f is string => f !== null && f !== '');
  if (validFilters.length === 0) return undefined;
  return validFilters.join(' AND ');
}
