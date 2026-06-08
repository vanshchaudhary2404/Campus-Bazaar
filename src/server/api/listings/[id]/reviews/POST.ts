import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { reviews, users } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const listingId = parseInt(req.params.id);
    const { rating, text, userId = 1 } = req.body;

    if (!rating || !text) return res.status(400).json({ error: 'Rating and text required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const result = await db.insert(reviews).values({
      listingId,
      userId: parseInt(userId),
      rating: parseInt(rating),
      text,
    });

    const insertId = Number(result[0].insertId);
    const newReview = await db
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
      .where(eq(reviews.id, insertId))
      .limit(1);

    res.status(201).json(newReview[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post review', message: String(error) });
  }
}
