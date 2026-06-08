import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { conversations } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { buyerId, sellerId, listingId } = req.body;
    if (!buyerId || !sellerId || !listingId) {
      return res.status(400).json({ error: 'buyerId, sellerId, listingId required' });
    }

    // Return existing conversation if one exists for this listing between these users
    const existing = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.buyerId, parseInt(buyerId)),
        eq(conversations.sellerId, parseInt(sellerId)),
        eq(conversations.listingId, parseInt(listingId)),
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    const result = await db.insert(conversations).values({
      buyerId: parseInt(buyerId),
      sellerId: parseInt(sellerId),
      listingId: parseInt(listingId),
    });

    const insertId = Number(result[0].insertId);
    const [created] = await db.select().from(conversations).where(eq(conversations.id, insertId)).limit(1);
    res.status(201).json(created);
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    res.status(500).json({ error: 'Failed to create conversation', message: String(error) });
  }
}
