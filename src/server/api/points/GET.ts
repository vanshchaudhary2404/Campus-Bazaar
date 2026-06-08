// GET /api/points?userId=123
// Returns the user's current points balance and recent ledger history
import type { Request, Response } from 'express';
import { db } from '../../db/client';
import { users, pointsLedger } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const userId = parseInt(req.query.userId as string);
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return res.status(404).json({ error: 'User not found' });

  const history = await db
    .select()
    .from(pointsLedger)
    .where(eq(pointsLedger.userId, userId))
    .orderBy(desc(pointsLedger.createdAt))
    .limit(20);

  res.json({ balance: user.points, history });
}
