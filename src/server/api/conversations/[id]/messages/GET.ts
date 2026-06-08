import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { messages, users } from '../../../../db/schema.js';
import { eq, asc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const convId = parseInt(req.params.id);
    if (!convId) return res.status(400).json({ error: 'Invalid conversation id' });

    const rows = await db
      .select({
        id: messages.id,
        text: messages.text,
        senderId: messages.senderId,
        status: messages.status,
        createdAt: messages.createdAt,
        senderName: users.name,
        senderAvatar: users.avatar,
        senderAvatarBg: users.avatarBg,
      })
      .from(messages)
      .leftJoin(users, eq(users.id, messages.senderId))
      .where(eq(messages.conversationId, convId))
      .orderBy(asc(messages.createdAt));

    res.json(rows);
  } catch (error) {
    console.error('GET /api/conversations/:id/messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', message: String(error) });
  }
}
