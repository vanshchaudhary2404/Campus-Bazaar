import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { reviews, users } from '../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) return res.status(400).json({ error: 'Invalid id' });

    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        text: reviews.text,
        createdAt: reviews.createdAt,
        reviewerName: users.name,
        reviewerAvatar: users.avatar,
        reviewerAvatarBg: users.avatarBg,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.listingId, listingId))
      .orderBy(sql`${reviews.createdAt} DESC`);

    const [stats] = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.listingId, listingId));

    res.json({
      reviews: rows,
      avg: parseFloat(String(stats?.avg ?? 0)).toFixed(1),
      count: stats?.count ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews', message: String(error) });
  }
}
