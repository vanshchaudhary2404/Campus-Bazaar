import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { listings, users } from '../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user id' });

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
        active: listings.active,
        createdAt: listings.createdAt,
        seller: users.name,
        sellerAvatar: users.avatar,
        sellerAvatarBg: users.avatarBg,
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.sellerId, userId))
      .orderBy(sql`${listings.createdAt} DESC`);

    res.json(rows.map(r => ({ ...r, rating: '4.5', reviews: 0, saved: false, postedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently' })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user listings', message: String(error) });
  }
}
