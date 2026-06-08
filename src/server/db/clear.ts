import { db } from './client.js';
import { users, listings, reviews, savedItems } from './schema.js';

async function clear() {
  console.log('🗑️  Clearing all tables...');
  await db.delete(reviews);
  await db.delete(savedItems);
  await db.delete(listings);
  await db.delete(users);
  console.log('✅ All tables cleared.');
}

clear().catch(console.error).finally(() => process.exit(0));
