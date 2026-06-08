import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { savedItems, listings, users } from '../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const userId = parseInt((req.query.userId as string) ?? '1');

    const rows = await db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        originalPrice: listings.originalPrice,
        category: listings.category,
        condition: listings.condition,
        location: listings.location,
        image: listings.image,
        tag: listings.tag,
        tagColor: listings.tagColor,
        createdAt: listings.createdAt,
        seller: users.name,
        sellerAvatar: users.avatar,
        sellerAvatarBg: users.avatarBg,
        sellerVerified: users.verified,
        sellerRating: users.rating,
        savedAt: savedItems.createdAt,
      })
      .from(savedItems)
      .innerJoin(listings, eq(savedItems.listingId, listings.id))
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(savedItems.userId, userId))
      .orderBy(sql`${savedItems.createdAt} DESC`);

    res.json(rows.map(r => ({ ...r, saved: true, rating: '4.5', reviews: 0 })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved items', message: String(error) });
  }
}
