#!/usr/bin/env tsx
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { createMeiliClient, waitForTasks } from '../packages/shared/src/meili';
import type { Product } from '../packages/shared/src/types';

const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || 'dev-master-key';

const TOTAL_PRODUCTS = 10000;
const BATCH_SIZE = 1000;

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Books',
  'Beauty & Personal Care',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Office Supplies',
];

const BRANDS = [
  'TechPro', 'SmartHome', 'StyleCo', 'ActiveGear', 'PureBeauty',
  'GameMaster', 'AutoElite', 'WellLife', 'OfficeMax', 'BookWorld',
  'SoundWave', 'FitLife', 'EcoHome', 'UrbanStyle', 'PowerTech',
  'ComfortPlus', 'SpeedRun', 'ClearView', 'SafeGuard', 'GreenLeaf',
  'BlueSky', 'RedDot', 'GoldStar', 'SilverLine', 'PlatinumEdge',
  'DiamondCut', 'RubyRed', 'EmeraldGreen', 'SapphireBlue', 'TopazYellow',
  'OnyxBlack', 'PearlWhite', 'AmberGlow', 'JadeGreen', 'CoralPink',
  'IndigoBlue', 'VioletPurple', 'CrimsonRed', 'NavyBlue', 'ForestGreen',
  'SkyBlue', 'SunsetOrange', 'MidnightBlack', 'SnowWhite', 'StoneGray',
  'OceanBlue', 'DesertSand', 'MountainGray', 'ValleyGreen', 'RiverBlue',
  'LakeSilver', 'CreekBrown', 'HillGold', 'PlainBeige', 'MeadowGreen',
  'PrairieYellow', 'CanyonRed', 'CliffGray', 'BeachTan', 'WaveTeal',
  'CloudWhite', 'RainGray', 'StormBlack', 'ThunderPurple', 'LightningYellow',
  'BreezeBlue', 'WindGreen', 'FrostWhite', 'SnowflakeBlue', 'IcebergWhite',
  'FlameRed', 'EmberOrange', 'AshGray', 'SmokeBlack', 'SparkGold',
  'GlowYellow', 'ShineWhite', 'ShimmerSilver', 'GlitterGold', 'SparkleBlue',
  'RadiantRed', 'BrilliantWhite', 'LuminousGreen', 'VibrantPurple', 'DazzlingYellow',
  'ElegantBlack', 'ChicWhite', 'ModernGray', 'ClassicBrown', 'VintageBeige',
  'RetroRed', 'ContemporaryBlue', 'TraditionalGreen', 'InnovativeSilver', 'PioneerGold',
  'ExplorerBrown', 'AdventurerGreen', 'DiscovererBlue', 'NavigatorGray', 'VoyagerWhite',
  'TravelerTan', 'WandererBrown', 'RoamerGreen', 'DrifterBlue', 'NomadGray',
];

const COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
  'Orange', 'Purple', 'Pink', 'Brown', 'Beige', 'Gold', 'Navy', 'Teal',
];

const PRODUCT_TEMPLATES = [
  { prefix: 'Wireless', suffix: 'Headphones', category: 'Electronics' },
  { prefix: 'Bluetooth', suffix: 'Earbuds', category: 'Electronics' },
  { prefix: 'Noise-Cancelling', suffix: 'Headset', category: 'Electronics' },
  { prefix: 'Smart', suffix: 'Watch', category: 'Electronics' },
  { prefix: 'Fitness', suffix: 'Tracker', category: 'Electronics' },
  { prefix: 'Portable', suffix: 'Speaker', category: 'Electronics' },
  { prefix: 'USB-C', suffix: 'Cable', category: 'Electronics' },
  { prefix: 'Wireless', suffix: 'Charger', category: 'Electronics' },
  { prefix: 'LED', suffix: 'Monitor', category: 'Electronics' },
  { prefix: 'Mechanical', suffix: 'Keyboard', category: 'Electronics' },
  { prefix: 'Gaming', suffix: 'Mouse', category: 'Electronics' },
  { prefix: 'Laptop', suffix: 'Stand', category: 'Electronics' },
  { prefix: 'Phone', suffix: 'Case', category: 'Electronics' },
  { prefix: 'Screen', suffix: 'Protector', category: 'Electronics' },
  { prefix: 'Cotton', suffix: 'T-Shirt', category: 'Clothing' },
  { prefix: 'Denim', suffix: 'Jeans', category: 'Clothing' },
  { prefix: 'Hooded', suffix: 'Sweatshirt', category: 'Clothing' },
  { prefix: 'Running', suffix: 'Shoes', category: 'Clothing' },
  { prefix: 'Athletic', suffix: 'Sneakers', category: 'Clothing' },
  { prefix: 'Leather', suffix: 'Jacket', category: 'Clothing' },
  { prefix: 'Winter', suffix: 'Coat', category: 'Clothing' },
  { prefix: 'Summer', suffix: 'Dress', category: 'Clothing' },
  { prefix: 'Stainless Steel', suffix: 'Pan', category: 'Home & Kitchen' },
  { prefix: 'Non-Stick', suffix: 'Cookware Set', category: 'Home & Kitchen' },
  { prefix: 'Electric', suffix: 'Kettle', category: 'Home & Kitchen' },
  { prefix: 'Coffee', suffix: 'Maker', category: 'Home & Kitchen' },
  { prefix: 'Microwave', suffix: 'Oven', category: 'Home & Kitchen' },
  { prefix: 'Yoga', suffix: 'Mat', category: 'Sports & Outdoors' },
  { prefix: 'Camping', suffix: 'Tent', category: 'Sports & Outdoors' },
  { prefix: 'Hiking', suffix: 'Backpack', category: 'Sports & Outdoors' },
  { prefix: 'Water', suffix: 'Bottle', category: 'Sports & Outdoors' },
];

const TAG_POOL = [
  'bestseller', 'new-arrival', 'limited-edition', 'eco-friendly', 'premium',
  'budget-friendly', 'top-rated', 'trending', 'clearance', 'exclusive',
  'handmade', 'organic', 'sustainable', 'recycled', 'waterproof',
  'wireless', 'rechargeable', 'portable', 'compact', 'lightweight',
  'durable', 'versatile', 'adjustable', 'ergonomic', 'professional',
];

// Generate realistic lat/lng (major cities worldwide)
const CITY_COORDS = [
  { lat: 40.7128, lng: -74.0060 },  // New York
  { lat: 51.5074, lng: -0.1278 },   // London
  { lat: 48.8566, lng: 2.3522 },    // Paris
  { lat: 35.6762, lng: 139.6503 },  // Tokyo
  { lat: -33.8688, lng: 151.2093 }, // Sydney
  { lat: 37.7749, lng: -122.4194 }, // San Francisco
  { lat: 52.5200, lng: 13.4050 },   // Berlin
  { lat: 41.9028, lng: 12.4964 },   // Rome
  { lat: 55.7558, lng: 37.6173 },   // Moscow
  { lat: 39.9042, lng: 116.4074 },  // Beijing
];

function generateProduct(index: number): Product {
  const template = faker.helpers.arrayElement(PRODUCT_TEMPLATES);
  const brand = faker.helpers.arrayElement(BRANDS);
  const color = faker.helpers.arrayElement(COLORS);

  // Generate product_id for grouping (10% of products are variants)
  const isVariant = faker.datatype.boolean({ probability: 0.1 });
  const baseProductId = isVariant && index > 100
    ? `PROD_${Math.floor(Math.random() * (index - 100))}`
    : `PROD_${index}`;

  const mainCategory = template.category;
  const subCategory = faker.helpers.arrayElement([
    'Premium',
    'Standard',
    'Basic',
    'Professional',
    'Home',
  ]);

  const title = `${brand} ${template.prefix} ${template.suffix} - ${color}`;

  const descriptions = [
    `Experience premium quality with the ${title}. Designed for maximum comfort and performance.`,
    `Discover the perfect blend of style and functionality with our ${template.prefix} ${template.suffix}. Built to last with high-quality materials.`,
    `Elevate your everyday with this exceptional ${template.suffix}. Features innovative design and superior craftsmanship.`,
    `The ${brand} ${template.prefix} ${template.suffix} combines cutting-edge technology with elegant aesthetics. Perfect for modern lifestyles.`,
  ];

  const description = faker.helpers.arrayElement(descriptions) + ' ' +
    faker.lorem.paragraph({ min: 1, max: 2 });

  const tags = faker.helpers.arrayElements(TAG_POOL, { min: 5, max: 10 });
  const cityCoord = faker.helpers.arrayElement(CITY_COORDS);

  return {
    id: `product_${index}`,
    product_id: baseProductId,
    title,
    description,
    brand,
    categories: [mainCategory, subCategory],
    tags,
    price: parseFloat(faker.commerce.price({ min: 10, max: 2000, dec: 2 })),
    rating: parseFloat((Math.random() * 5).toFixed(1)),
    in_stock: faker.datatype.boolean({ probability: 0.85 }),
    popularity: faker.number.int({ min: 0, max: 10000 }),
    created_at: faker.date.between({
      from: '2020-01-01',
      to: '2024-12-31',
    }).toISOString(),
    color,
    _geo: {
      lat: cityCoord.lat + (Math.random() - 0.5) * 0.1, // Slight variation
      lng: cityCoord.lng + (Math.random() - 0.5) * 0.1,
    },
  };
}

async function seedProducts() {
  console.log('🌱 Seeding products...\n');

  const client = createMeiliClient(MEILI_HOST, MEILI_MASTER_KEY);
  const index = client.index('products');

  const taskUids: number[] = [];

  for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
    const batch: Product[] = [];
    const end = Math.min(i + BATCH_SIZE, TOTAL_PRODUCTS);

    for (let j = i; j < end; j++) {
      batch.push(generateProduct(j));
    }

    console.log(`📦 Adding products ${i + 1} - ${end}...`);
    const task = await index.addDocuments(batch);
    taskUids.push(task.taskUid);
  }

  console.log(`\n⏳ Waiting for ${taskUids.length} indexing tasks to complete...`);
  await waitForTasks(client, taskUids);

  const stats = await index.getStats();
  console.log(`\n✅ Successfully indexed ${stats.numberOfDocuments} products!`);
  console.log(`   Indexing: ${stats.isIndexing ? 'still in progress' : 'complete'}\n`);
}

seedProducts().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
