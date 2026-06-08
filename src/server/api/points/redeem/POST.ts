// POST /api/points/redeem
// Redeems points for a discount on a purchase
// Body: { userId, pointsToRedeem, listingId }
// Rules: 1 point = ₹1 discount. Max 50% of listing price can be covered by points.
import type { Request, Response } from 'express';
import { db } from '../../../db/client';
import { users, pointsLedger, listings } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export const POINTS_TO_RUPEE = 1; // 1 point = ₹1

export default async function handler(req: Request, res: Response) {
  const { userId, pointsToRedeem, listingId } = req.body as {
    userId: number;
    pointsToRedeem: number;
    listingId: number;
  };

  if (!userId || !pointsToRedeem || !listingId) {
    return res.status(400).json({ error: 'userId, pointsToRedeem, and listingId are required' });
  }
  if (pointsToRedeem <= 0) {
    return res.status(400).json({ error: 'pointsToRedeem must be positive' });
  }

  // Fetch user balance
  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.points < pointsToRedeem) {
    return res.status(400).json({ error: 'Insufficient points balance' });
  }

  // Fetch listing price for cap validation
  const [listing] = await db
    .select({ price: listings.price })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const maxDiscount = Math.floor(listing.price * 0.5); // max 50% off
  const discount = Math.min(pointsToRedeem * POINTS_TO_RUPEE, maxDiscount);
  const actualPointsUsed = Math.ceil(discount / POINTS_TO_RUPEE);

  // Deduct from ledger
  await db.insert(pointsLedger).values({
    userId,
    delta: -actualPointsUsed,
    reason: `Redeemed for listing #${listingId}`,
    listingId,
  });

  // Decrement user balance
  await db
    .update(users)
    .set({ points: sql`${users.points} - ${actualPointsUsed}` })
    .where(eq(users.id, userId));

  const [updated] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  res.json({
    success: true,
    pointsUsed: actualPointsUsed,
    discount,
    finalPrice: listing.price - discount,
    newBalance: updated?.points ?? 0,
  });
}
