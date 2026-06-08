import { db } from './client.js';
import { conversations, messages, users, listings } from './schema.js';
import { sql } from 'drizzle-orm';

async function seedChat() {
  console.log('💬 Seeding chat data...');

  // Check if already seeded
  const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(conversations);
  if (Number(count) > 0) {
    console.log('✅ Chat already seeded, skipping.');
    return;
  }

  // Get first 5 users and first 4 listings
  const allUsers = await db.select({ id: users.id, name: users.name }).from(users).limit(10);
  const allListings = await db.select({ id: listings.id, title: listings.title, sellerId: listings.sellerId }).from(listings).limit(20);

  if (allUsers.length < 2 || allListings.length < 1) {
    console.log('⚠️  Not enough users/listings to seed chat. Run seed.ts first.');
    return;
  }

  // Create 4 demo conversations: user[0] is the "logged in" buyer chatting with sellers
  const buyer = allUsers[0];

  const demoConvos = [
    {
      listing: allListings.find(l => l.sellerId !== buyer.id) ?? allListings[1],
      messages: [
        { from: 'buyer', text: 'Hi! Is this still available?' },
        { from: 'seller', text: 'Yes it is! Just listed it.' },
        { from: 'buyer', text: 'Can you do a small discount?' },
        { from: 'seller', text: 'Sure, I can meet at the library at 5pm' },
      ],
    },
    {
      listing: allListings.find(l => l.sellerId !== buyer.id && l.id !== allListings[1]?.id) ?? allListings[2],
      messages: [
        { from: 'buyer', text: 'Hey, is this in good condition?' },
        { from: 'seller', text: 'Yes! Barely used, like new.' },
        { from: 'buyer', text: "What's the battery health?" },
        { from: 'seller', text: 'The battery health is 94%, barely used' },
      ],
    },
    {
      listing: allListings[3] ?? allListings[0],
      messages: [
        { from: 'buyer', text: 'Is this available?' },
        { from: 'seller', text: 'Yes, come check it out anytime.' },
        { from: 'buyer', text: 'Can I see it tomorrow?' },
      ],
    },
    {
      listing: allListings[4] ?? allListings[0],
      messages: [
        { from: 'buyer', text: 'Are these still available?' },
        { from: 'seller', text: "Yes! They're in perfect condition." },
        { from: 'buyer', text: 'Can we meet at the food court?' },
        { from: 'seller', text: 'Sounds good, see you then!' },
      ],
    },
  ];

  for (const demo of demoConvos) {
    const listing = demo.listing;
    if (!listing) continue;

    // Find a seller that isn't the buyer
    const seller = allUsers.find(u => u.id === listing.sellerId && u.id !== buyer.id)
      ?? allUsers.find(u => u.id !== buyer.id);
    if (!seller) continue;

    const convResult = await db.insert(conversations).values({
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing.id,
    });
    const convId = Number(convResult[0].insertId);

    // Insert messages with staggered timestamps
    let baseTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    for (const msg of demo.messages) {
      baseTime = new Date(baseTime.getTime() + 2 * 60 * 1000); // +2 min each
      await db.insert(messages).values({
        conversationId: convId,
        senderId: msg.from === 'buyer' ? buyer.id : seller.id,
        text: msg.text,
        status: 'read',
        createdAt: baseTime,
      });
    }
  }

  console.log(`✅ Chat seeded: ${demoConvos.length} conversations created.`);
}

seedChat().catch(console.error).finally(() => process.exit(0));
