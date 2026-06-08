// POST /api/points/earn
// Awards points to a user (e.g. after posting a listing, completing a sale)
// Body: { userId, delta, reason, listingId? }
import type { Request, Response } from 'express';
import { db } from '../../../db/client';
import { users, pointsLedger } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const { userId, delta, reason, listingId } = req.body as {
    userId: number;
    delta: number;
    reason: string;
    listingId?: number;
  };

  if (!userId || !delta || delta <= 0 || !reason) {
    return res.status(400).json({ error: 'userId, positive delta, and reason are required' });
  }

  // Add ledger entry
  await db.insert(pointsLedger).values({
    userId,
    delta,
    reason,
    listingId: listingId ?? null,
  });

  // Increment user balance
  await db
    .update(users)
    .set({ points: sql`${users.points} + ${delta}` })
    .where(eq(users.id, userId));

  const [updated] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  res.json({ success: true, newBalance: updated?.points ?? 0 });
}
