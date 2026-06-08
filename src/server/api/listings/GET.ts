import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { listings, users, reviews } from '../../db/schema.js';
import { eq, and, like, sql, asc, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const {
      category,
      search,
      condition,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [eq(listings.active, true)];
    if (category && category !== 'All') conditions.push(eq(listings.category, category as any));
    if (condition) conditions.push(eq(listings.condition, condition as any));
    if (minPrice) conditions.push(sql`${listings.price} >= ${parseInt(minPrice)}`);
    if (maxPrice) conditions.push(sql`${listings.price} <= ${parseInt(maxPrice)}`);
    if (search) conditions.push(like(listings.title, `%${search}%`));

    const where = and(...conditions);

    // Sort
    const orderBy =
      sort === 'price_asc' ? asc(listings.price) :
      sort === 'price_desc' ? desc(listings.price) :
      desc(listings.createdAt);

    // Fetch listings with seller info
    const rows = await db
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
      .where(where)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    // Get review counts + avg ratings
    const reviewStats = await db
      .select({
        listingId: reviews.listingId,
        count: sql<number>`COUNT(*)`,
        avg: sql<number>`AVG(${reviews.rating})`,
      })
      .from(reviews)
      .groupBy(reviews.listingId);

    const statsMap = new Map(reviewStats.map(r => [r.listingId, r]));

    const result = rows.map(row => ({
      ...row,
      rating: parseFloat(String(statsMap.get(row.id)?.avg ?? 4.5)).toFixed(1),
      reviews: statsMap.get(row.id)?.count ?? 0,
      saved: false,
    }));

    // Total count
    const [{ total }] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(listings)
      .where(where);

    res.json({ listings: result, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('GET /api/listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings', message: String(error) });
  }
}
