#!/usr/bin/env tsx
import 'dotenv/config';
import { createMeiliClient, waitForTasks } from '../packages/shared/src/meili';

const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || 'dev-master-key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function bootstrap() {
  const cleanMode = process.argv.includes('--clean');

  console.log('🚀 Bootstrapping Meilisearch indexes...\n');
  if (cleanMode) {
    console.log('🧹 Clean mode enabled - existing indices will be deleted\n');
  }

  const client = createMeiliClient(MEILI_HOST, MEILI_MASTER_KEY);

  // Verify connection
  try {
    const health = await client.health();
    console.log('✅ Connected to Meilisearch:', health.status);
  } catch (error) {
    console.error('❌ Failed to connect to Meilisearch. Is it running?');
    console.error('Run: cd infra && docker compose up -d');
    process.exit(1);
  }

  if (!OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set. Embedders will not be configured.');
    console.warn('   Vector search will not work without embedders.');
    console.warn('   Set OPENAI_API_KEY in your environment to enable hybrid search.\n');
  }

  // Delete existing indexes if in clean mode
  if (cleanMode) {
    console.log('🗑️  Deleting existing indexes...');
    const deleteTasks: number[] = [];

    try {
      const productsDeleteTask = await client.deleteIndex('products');
      deleteTasks.push(productsDeleteTask.taskUid);
      console.log('  - products index deleted (task:', productsDeleteTask.taskUid, ')');
    } catch (error: any) {
      if (error.code === 'index_not_found') {
        console.log('  - products index does not exist (skipping)');
      } else {
        throw error;
      }
    }

    try {
      const articlesDeleteTask = await client.deleteIndex('articles');
      deleteTasks.push(articlesDeleteTask.taskUid);
      console.log('  - articles index deleted (task:', articlesDeleteTask.taskUid, ')');
    } catch (error: any) {
      if (error.code === 'index_not_found') {
        console.log('  - articles index does not exist (skipping)');
      } else {
        throw error;
      }
    }

    if (deleteTasks.length > 0) {
      await waitForTasks(client, deleteTasks);
      console.log('✅ Deletion complete\n');
    }
  }

  // Create indexes
  console.log('📦 Creating indexes...');
  const tasks: number[] = [];

  try {
    const productsTask = await client.createIndex('products', { primaryKey: 'id' });
    tasks.push(productsTask.taskUid);
    console.log('  - products index created (task:', productsTask.taskUid, ')');
  } catch (error: any) {
    if (error.code === 'index_already_exists') {
      console.log('  - products index already exists');
    } else {
      throw error;
    }
  }

  try {
    const articlesTask = await client.createIndex('articles', { primaryKey: 'id' });
    tasks.push(articlesTask.taskUid);
    console.log('  - articles index created (task:', articlesTask.taskUid, ')');
  } catch (error: any) {
    if (error.code === 'index_already_exists') {
      console.log('  - articles index already exists');
    } else {
      throw error;
    }
  }

  if (tasks.length > 0) {
    await waitForTasks(client, tasks);
  }

  console.log('\n⚙️  Configuring products index...');
  const productsIndex = client.index('products');

  // Products: Embedder configuration
  if (OPENAI_API_KEY) {
    console.log('  - Configuring OpenAI embedder...');
    await productsIndex.updateEmbedders({
      openai: {
        source: 'openAi',
        apiKey: OPENAI_API_KEY,
        dimensions: 1536,
        model: 'text-embedding-3-small',
        documentTemplate: `title: {{doc.title}}
{{doc.description}}
brand: {{doc.brand}}
categories: {{doc.categories}}
tags: {{doc.tags}}`,
      },
    });
  }

  // Products: Settings
  console.log('  - Updating settings...');
  const productsSettingsTask = await productsIndex.updateSettings({
    searchableAttributes: [
      'title',
      'description',
      'brand',
      'categories',
      'tags',
    ],
    filterableAttributes: [
      'categories',
      'brand',
      'tags',
      'price',
      'rating',
      'in_stock',
      '_geo',
      'color',
      'created_at',
      'product_id',
    ],
    sortableAttributes: [
      'price',
      'rating',
      'popularity',
      'created_at',
      '_geo',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'popularity:desc',
      'rating:desc',
    ],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 5,
        twoTypos: 9,
      },
      disableOnAttributes: ['product_id'],
    },
    faceting: {
      maxValuesPerFacet: 100,
      sortFacetValuesBy: {
        '*': 'count',
        color: 'alpha',
      },
    },
    pagination: {
      maxTotalHits: 10000,
    },
  });

  // Products: Synonyms
  console.log('  - Setting up synonyms...');
  const productsSynonymsTask = await productsIndex.updateSynonyms({
    cellphone: ['smartphone', 'mobile phone'],
    smartphone: ['cellphone', 'mobile phone'],
    sneakers: ['trainers', 'running shoes'],
    trainers: ['sneakers', 'running shoes'],
    hoodie: ['hooded sweatshirt', 'hoody'],
    laptop: ['notebook', 'portable computer'],
    notebook: ['laptop'],
    earbuds: ['in-ear headphones', 'earphones'],
    headphones: ['earbuds', 'headset'],
    tv: ['television'],
    fridge: ['refrigerator'],
    couch: ['sofa'],
  });

  await waitForTasks(client, [productsSettingsTask.taskUid, productsSynonymsTask.taskUid]);

  console.log('\n⚙️  Configuring articles index...');
  const articlesIndex = client.index('articles');

  // Articles: Embedder configuration
  if (OPENAI_API_KEY) {
    console.log('  - Configuring OpenAI embedder...');
    await articlesIndex.updateEmbedders({
      openai: {
        source: 'openAi',
        apiKey: OPENAI_API_KEY,
        dimensions: 1536,
        model: 'text-embedding-3-small',
        documentTemplate: `{{doc.title}}

{{doc.body}}

Topics: {{doc.topics}}`,
      },
    });
  }

  // Articles: Settings
  console.log('  - Updating settings...');
  const articlesSettingsTask = await articlesIndex.updateSettings({
    searchableAttributes: [
      'title',
      'body',
      'topics',
    ],
    filterableAttributes: [
      'topics',
      'author',
      'published_at',
      'product_refs',
    ],
    sortableAttributes: [
      'published_at',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 5,
        twoTypos: 9,
      },
    },
    faceting: {
      maxValuesPerFacet: 100,
      sortFacetValuesBy: {
        '*': 'count',
        author: 'alpha',
      },
    },
    pagination: {
      maxTotalHits: 1000,
    },
  });

  // Articles: Synonyms
  console.log('  - Setting up synonyms...');
  const articlesSynonymsTask = await articlesIndex.updateSynonyms({
    return: ['refund', 'send back'],
    refund: ['return', 'money back'],
    warranty: ['guarantee'],
    shipping: ['delivery'],
    delivery: ['shipping'],
  });

  await waitForTasks(client, [articlesSettingsTask.taskUid, articlesSynonymsTask.taskUid]);

  console.log('\n✨ Bootstrap complete!\n');
  console.log('Next steps:');
  console.log('  1. Run: pnpm seed');
  console.log('  2. Run: pnpm dev');
  console.log('  3. Open: http://localhost:3000\n');
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
