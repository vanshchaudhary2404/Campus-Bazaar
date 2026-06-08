// POST /api/listings/:id/sold
// Marks a listing as sold (inactive), increments seller's totalSales,
// and awards +100 Campus Points to the seller.
// Only the seller themselves may call this endpoint.
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { listings, users, pointsLedger } from '../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

const POINTS_FOR_SALE = 100;

export default async function handler(req: Request, res: Response) {
  try {
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) return res.status(400).json({ error: 'Invalid listing id' });

    // sellerUserId must be passed from the client (resolved via /api/users/by-email)
    const { sellerUserId } = req.body as { sellerUserId: number };
    if (!sellerUserId) return res.status(400).json({ error: 'sellerUserId is required' });

    // Fetch listing and verify ownership
    const [listing] = await db
      .select({ id: listings.id, sellerId: listings.sellerId, active: listings.active })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId !== sellerUserId) {
      return res.status(403).json({ error: 'Only the seller can mark this listing as sold' });
    }
    if (!listing.active) {
      return res.status(400).json({ error: 'Listing is already marked as sold' });
    }

    // Mark listing inactive
    await db
      .update(listings)
      .set({ active: false })
      .where(eq(listings.id, listingId));

    // Increment seller's totalSales
    await db
      .update(users)
      .set({ totalSales: sql`${users.totalSales} + 1` })
      .where(eq(users.id, sellerUserId));

    // Award points — non-fatal if it fails
    try {
      await db.insert(pointsLedger).values({
        userId: sellerUserId,
        delta: POINTS_FOR_SALE,
        reason: `Completed a sale (listing #${listingId})`,
        listingId,
      });
      await db
        .update(users)
        .set({ points: sql`${users.points} + ${POINTS_FOR_SALE}` })
        .where(eq(users.id, sellerUserId));
    } catch (pointsErr) {
      console.error('Failed to award sale points:', pointsErr);
    }

    res.json({ success: true, pointsAwarded: POINTS_FOR_SALE });
  } catch (error) {
    console.error('POST /api/listings/:id/sold error:', error);
    res.status(500).json({ error: 'Failed to mark listing as sold', message: String(error) });
  }
}
