import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { messages, conversations, users } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const convId = parseInt(req.params.id);
    const { senderId, text } = req.body;

    if (!convId || !senderId || !text?.trim()) {
      return res.status(400).json({ error: 'convId, senderId, text required' });
    }

    const result = await db.insert(messages).values({
      conversationId: convId,
      senderId: parseInt(senderId),
      text: text.trim(),
      status: 'sent',
    });

    // Bump conversation updatedAt
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, convId));

    const insertId = Number(result[0].insertId);
    const [msg] = await db
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
      .where(eq(messages.id, insertId))
      .limit(1);

    res.status(201).json(msg);
  } catch (error) {
    console.error('POST /api/conversations/:id/messages error:', error);
    res.status(500).json({ error: 'Failed to send message', message: String(error) });
  }
}
