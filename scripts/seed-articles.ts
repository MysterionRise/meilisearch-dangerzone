#!/usr/bin/env tsx
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { createMeiliClient, waitForTasks } from '../packages/shared/src/meili';
import type { Article } from '../packages/shared/src/types';

const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || 'dev-master-key';

const TOTAL_ARTICLES = 800;
const BATCH_SIZE = 100;

const TOPICS = [
  'setup',
  'getting-started',
  'troubleshooting',
  'returns',
  'warranty',
  'sustainability',
  'care-instructions',
  'compatibility',
  'installation',
  'maintenance',
  'features',
  'comparison',
  'best-practices',
  'tips-and-tricks',
  'updates',
  'security',
  'privacy',
  'shipping',
  'payment',
  'customer-service',
];

const AUTHORS = [
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim',
  'Jessica Williams',
  'Christopher Brown',
  'Amanda Davis',
  'James Wilson',
  'Jennifer Martinez',
  'Robert Taylor',
];

const ARTICLE_TEMPLATES = [
  {
    title: 'How to Set Up Your {product}',
    topics: ['setup', 'getting-started', 'installation'],
    bodyTemplate: 'complete guide to setting up',
  },
  {
    title: 'Troubleshooting Common {product} Issues',
    topics: ['troubleshooting', 'maintenance', 'tips-and-tricks'],
    bodyTemplate: 'common problems and solutions for',
  },
  {
    title: 'Understanding Your {product} Warranty',
    topics: ['warranty', 'customer-service', 'returns'],
    bodyTemplate: 'comprehensive warranty information for',
  },
  {
    title: 'Sustainable Materials in {product} Manufacturing',
    topics: ['sustainability', 'features', 'best-practices'],
    bodyTemplate: 'environmental impact and sustainable practices in',
  },
  {
    title: 'Caring for Your {product}: Maintenance Guide',
    topics: ['care-instructions', 'maintenance', 'best-practices'],
    bodyTemplate: 'proper care and maintenance procedures for',
  },
  {
    title: '{product} Compatibility Guide',
    topics: ['compatibility', 'features', 'tips-and-tricks'],
    bodyTemplate: 'compatibility information and recommendations for',
  },
  {
    title: 'Advanced Features of {product}',
    topics: ['features', 'tips-and-tricks', 'best-practices'],
    bodyTemplate: 'exploring advanced capabilities of',
  },
  {
    title: 'Comparing {product} Models',
    topics: ['comparison', 'features', 'best-practices'],
    bodyTemplate: 'detailed comparison of different models in',
  },
  {
    title: 'Security Features in {product}',
    topics: ['security', 'privacy', 'features'],
    bodyTemplate: 'security and privacy features of',
  },
  {
    title: 'Shipping and Returns for {product}',
    topics: ['shipping', 'returns', 'customer-service'],
    bodyTemplate: 'shipping options and return policies for',
  },
];

const PRODUCT_KEYWORDS = [
  'Wireless Headphones',
  'Bluetooth Earbuds',
  'Smart Watch',
  'Fitness Tracker',
  'Portable Speaker',
  'Laptop Stand',
  'Phone Case',
  'Running Shoes',
  'Yoga Mat',
  'Coffee Maker',
  'Electric Kettle',
  'Gaming Mouse',
  'Mechanical Keyboard',
  'LED Monitor',
  'Camping Tent',
  'Hiking Backpack',
  'Water Bottle',
  'Cotton T-Shirt',
  'Denim Jeans',
  'Winter Coat',
];

function generateArticleBody(template: typeof ARTICLE_TEMPLATES[0], productKeyword: string): string {
  const paragraphs: string[] = [];

  // Introduction
  paragraphs.push(
    `Welcome to our ${template.bodyTemplate} ${productKeyword}. ` +
    faker.lorem.paragraph({ min: 2, max: 3 })
  );

  // Main content (2-5 paragraphs)
  const numParagraphs = faker.number.int({ min: 2, max: 5 });
  for (let i = 0; i < numParagraphs; i++) {
    const sectionIntros = [
      `When it comes to ${productKeyword}, `,
      `It's important to note that `,
      `Many users find that `,
      `One key aspect to consider is `,
      `Research shows that `,
    ];

    paragraphs.push(
      faker.helpers.arrayElement(sectionIntros) +
      faker.lorem.paragraph({ min: 3, max: 5 })
    );
  }

  // Add some product-specific content
  if (template.topics.includes('troubleshooting')) {
    paragraphs.push(
      `Common issues with ${productKeyword} include connectivity problems, battery drain, and software glitches. ` +
      faker.lorem.paragraph({ min: 2, max: 3 })
    );
  } else if (template.topics.includes('sustainability')) {
    paragraphs.push(
      `Our commitment to sustainability means that ${productKeyword} products are manufactured using eco-friendly materials and processes. ` +
      faker.lorem.paragraph({ min: 2, max: 3 })
    );
  } else if (template.topics.includes('warranty')) {
    paragraphs.push(
      `The standard warranty for ${productKeyword} covers manufacturing defects and normal wear and tear for up to 24 months from the date of purchase. ` +
      faker.lorem.paragraph({ min: 1, max: 2 })
    );
  }

  // Conclusion
  paragraphs.push(
    `In conclusion, ` + faker.lorem.paragraph({ min: 2, max: 3 }) +
    ` For more information about ${productKeyword}, please contact our customer service team.`
  );

  return paragraphs.join('\n\n');
}

function generateArticle(index: number): Article {
  const template = faker.helpers.arrayElement(ARTICLE_TEMPLATES);
  const productKeyword = faker.helpers.arrayElement(PRODUCT_KEYWORDS);
  const author = faker.helpers.arrayElement(AUTHORS);

  const title = template.title.replace('{product}', productKeyword);
  const body = generateArticleBody(template, productKeyword);

  // Add some additional topics
  const additionalTopics = faker.helpers.arrayElements(
    TOPICS.filter(t => !template.topics.includes(t)),
    { min: 0, max: 2 }
  );

  const allTopics = [...template.topics, ...additionalTopics];

  // Generate product references (5% chance per reference, max 3)
  const productRefs: string[] = [];
  const numRefs = faker.number.int({ min: 0, max: 3 });
  for (let i = 0; i < numRefs; i++) {
    const refId = `PROD_${faker.number.int({ min: 0, max: 9999 })}`;
    if (!productRefs.includes(refId)) {
      productRefs.push(refId);
    }
  }

  return {
    id: `article_${index}`,
    title,
    body,
    topics: allTopics,
    author,
    published_at: faker.date.between({
      from: '2020-01-01',
      to: '2024-12-31',
    }).toISOString(),
    product_refs: productRefs,
  };
}

async function seedArticles() {
  console.log('📝 Seeding articles...\n');

  const client = createMeiliClient(MEILI_HOST, MEILI_MASTER_KEY);
  const index = client.index('articles');

  const taskUids: number[] = [];

  for (let i = 0; i < TOTAL_ARTICLES; i += BATCH_SIZE) {
    const batch: Article[] = [];
    const end = Math.min(i + BATCH_SIZE, TOTAL_ARTICLES);

    for (let j = i; j < end; j++) {
      batch.push(generateArticle(j));
    }

    console.log(`📦 Adding articles ${i + 1} - ${end}...`);
    const task = await index.addDocuments(batch);
    taskUids.push(task.taskUid);
  }

  console.log(`\n⏳ Waiting for ${taskUids.length} indexing tasks to complete...`);
  await waitForTasks(client, taskUids);

  const stats = await index.getStats();
  console.log(`\n✅ Successfully indexed ${stats.numberOfDocuments} articles!`);
  console.log(`   Indexing: ${stats.isIndexing ? 'still in progress' : 'complete'}\n`);
}

seedArticles().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
