import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { listings, users, pointsLedger } from '../../db/schema.js';
import { eq, asc, sql } from 'drizzle-orm';

const POINTS_FOR_LISTING = 50;

export default async function handler(req: Request, res: Response) {
  try {
    const {
      title, description, price, originalPrice,
      category, condition, location, image,
      tag, tagColor,
      sellerName, sellerEmail,
    } = req.body;

    if (!title || !description || !price || !category || !condition || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Resolve seller: match by email, or create, or fall back to first real user
    let sellerId: number | null = null;

    if (sellerEmail) {
      const existing = await db.select().from(users).where(eq(users.email, sellerEmail)).limit(1);
      if (existing.length > 0) {
        sellerId = existing[0].id;
      } else if (sellerName) {
        const result = await db.insert(users).values({
          name: sellerName,
          email: sellerEmail,
          avatar: sellerName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          avatarBg: 'bg-indigo-100 text-indigo-700',
        });
        sellerId = Number(result[0].insertId);
      }
    }

    // Fall back to the first user in the table
    if (!sellerId) {
      const firstUser = await db.select({ id: users.id }).from(users).orderBy(asc(users.id)).limit(1);
      if (firstUser.length === 0) {
        return res.status(500).json({ error: 'No users in database. Please seed first.' });
      }
      sellerId = firstUser[0].id;
    }

    // Use a safe image URL — reject raw base64 data URIs (too large for varchar(500))
    const safeImage = image && !image.startsWith('data:')
      ? image
      : '/airo-assets/images/listings/textbooks';

    const result = await db.insert(listings).values({
      sellerId,
      title,
      description,
      price: parseInt(price),
      originalPrice: parseInt(originalPrice ?? price),
      category,
      condition,
      location,
      image: safeImage,
      tag: tag ?? null,
      tagColor: tagColor ?? null,
    });

    const insertId = Number(result[0].insertId);

    // Award points to the seller for posting a listing
    try {
      await db.insert(pointsLedger).values({
        userId: sellerId,
        delta: POINTS_FOR_LISTING,
        reason: 'Posted a new listing',
        listingId: insertId,
      });
      await db
        .update(users)
        .set({ points: sql`${users.points} + ${POINTS_FOR_LISTING}` })
        .where(eq(users.id, sellerId));
    } catch (pointsErr) {
      // Non-fatal — listing was created successfully
      console.error('Failed to award listing points:', pointsErr);
    }

    const [newListing] = await db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        originalPrice: listings.originalPrice,
        category: listings.category,
        condition: listings.condition,
        location: listings.location,
        image: listings.image,
        tag: listings.tag,
        tagColor: listings.tagColor,
        createdAt: listings.createdAt,
        seller: users.name,
        sellerAvatar: users.avatar,
        sellerAvatarBg: users.avatarBg,
        sellerVerified: users.verified,
        sellerRating: users.rating,
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.id, insertId))
      .limit(1);

    res.status(201).json({
      ...newListing,
      rating: '4.5',
      reviews: 0,
      saved: false,
    });
  } catch (error) {
    console.error('POST /api/listings error:', error);
    res.status(500).json({ error: 'Failed to create listing', message: String(error) });
  }
}
