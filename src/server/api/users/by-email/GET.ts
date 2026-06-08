import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: 'email required' });

    const [user] = await db
      .select({ id: users.id, name: users.name, avatar: users.avatar, avatarBg: users.avatarBg })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to lookup user', message: String(error) });
  }
}
