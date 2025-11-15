#!/usr/bin/env tsx
import 'dotenv/config';
import { createMeiliClient } from '../packages/shared/src/meili';

const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || 'dev-master-key';

async function checkTasks() {
  const client = createMeiliClient(MEILI_HOST, MEILI_MASTER_KEY);

  console.log('📊 Checking Meilisearch tasks...\n');

  try {
    const tasksResponse = await client.getTasks({ limit: 20 });
    const tasks = tasksResponse.results;

    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    console.log(`Found ${tasksResponse.total} total tasks. Showing latest 20:\n`);

    tasks.forEach((task) => {
      const statusIcon =
        task.status === 'succeeded' ? '✅' :
        task.status === 'failed' ? '❌' :
        task.status === 'processing' ? '⏳' :
        '⏸️';

      console.log(`${statusIcon} [${task.uid}] ${task.type} - ${task.status}`);

      if (task.indexUid) {
        console.log(`   Index: ${task.indexUid}`);
      }

      if (task.status === 'processing') {
        console.log(`   Started: ${new Date(task.enqueuedAt).toLocaleString()}`);
      }

      if (task.status === 'succeeded' && task.finishedAt) {
        const duration = new Date(task.finishedAt).getTime() - new Date(task.enqueuedAt).getTime();
        console.log(`   Duration: ${duration}ms`);
      }

      if (task.status === 'failed' && task.error) {
        console.log(`   Error: ${task.error.message}`);
      }

      console.log('');
    });

    // Summary
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Check index stats
    console.log('\n📈 Index statistics:\n');

    try {
      const productsIndex = client.index('products');
      const productsStats = await productsIndex.getStats();
      console.log(`Products: ${productsStats.numberOfDocuments.toLocaleString()} documents`);
      console.log(`  Indexing: ${productsStats.isIndexing ? 'in progress' : 'idle'}`);
    } catch (error) {
      console.log('Products: index not found');
    }

    try {
      const articlesIndex = client.index('articles');
      const articlesStats = await articlesIndex.getStats();
      console.log(`Articles: ${articlesStats.numberOfDocuments.toLocaleString()} documents`);
      console.log(`  Indexing: ${articlesStats.isIndexing ? 'in progress' : 'idle'}`);
    } catch (error) {
      console.log('Articles: index not found');
    }

  } catch (error) {
    console.error('❌ Failed to check tasks:', error);
    process.exit(1);
  }
}

checkTasks();
