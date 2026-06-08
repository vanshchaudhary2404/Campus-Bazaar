import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { messages } from '../../../../db/schema.js';
import { eq, and, ne, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const convId = parseInt(req.params.id);
    const { userId } = req.body;
    if (!convId || !userId) return res.status(400).json({ error: 'convId and userId required' });

    // Mark all messages not sent by this user as read
    await db
      .update(messages)
      .set({ status: 'read' })
      .where(and(
        eq(messages.conversationId, convId),
        ne(messages.senderId, parseInt(userId)),
        sql`${messages.status} != 'read'`,
      ));

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark read', message: String(error) });
  }
}
