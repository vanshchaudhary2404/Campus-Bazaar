import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { conversations, messages, users, listings } from '../../db/schema.js';
import { eq, or, desc, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Get all conversations where user is buyer or seller
    const rows = await db
      .select({
        id: conversations.id,
        buyerId: conversations.buyerId,
        sellerId: conversations.sellerId,
        listingId: conversations.listingId,
        updatedAt: conversations.updatedAt,
        buyerName: users.name,
        buyerAvatar: users.avatar,
        buyerAvatarBg: users.avatarBg,
        listingTitle: listings.title,
        listingPrice: listings.price,
      })
      .from(conversations)
      .leftJoin(users, eq(users.id,
        sql`CASE WHEN ${conversations.buyerId} = ${userId} THEN ${conversations.sellerId} ELSE ${conversations.buyerId} END`
      ))
      .leftJoin(listings, eq(listings.id, conversations.listingId))
      .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)))
      .orderBy(desc(conversations.updatedAt));

    // For each conversation, get last message + unread count
    const enriched = await Promise.all(rows.map(async (row) => {
      const [lastMsg] = await db
        .select({ text: messages.text, createdAt: messages.createdAt, senderId: messages.senderId })
        .from(messages)
        .where(eq(messages.conversationId, row.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const [{ unread }] = await db
        .select({ unread: sql<number>`COUNT(*)` })
        .from(messages)
        .where(
          sql`${messages.conversationId} = ${row.id} AND ${messages.senderId} != ${userId} AND ${messages.status} != 'read'`
        );

      return {
        ...row,
        lastMessage: lastMsg
          ? (lastMsg.senderId === userId ? `You: ${lastMsg.text}` : lastMsg.text)
          : 'No messages yet',
        lastMessageTime: lastMsg?.createdAt ?? row.updatedAt,
        unread: Number(unread),
        online: false,
      };
    }));

    res.json(enriched);
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', message: String(error) });
  }
}
