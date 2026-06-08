import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { savedItems } from '../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const listingId = parseInt(req.params.id);
    const userId = parseInt(req.body.userId ?? '1'); // demo: default to user 1

    if (isNaN(listingId)) return res.status(400).json({ error: 'Invalid id' });

    // Check if already saved
    const existing = await db
      .select()
      .from(savedItems)
      .where(and(eq(savedItems.userId, userId), eq(savedItems.listingId, listingId)))
      .limit(1);

    if (existing.length > 0) {
      // Unsave
      await db
        .delete(savedItems)
        .where(and(eq(savedItems.userId, userId), eq(savedItems.listingId, listingId)));
      return res.json({ saved: false });
    }

    // Save
    await db.insert(savedItems).values({ userId, listingId });
    res.json({ saved: true });
  } catch (error) {
    console.error('POST /api/listings/:id/save error:', error);
    res.status(500).json({ error: 'Failed to save listing', message: String(error) });
  }
}
