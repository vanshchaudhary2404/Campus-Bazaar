import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { listings, users, reviews } from '../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const rows = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        originalPrice: listings.originalPrice,
        category: listings.category,
        condition: listings.condition,
        location: listings.location,
        image: listings.image,
        tag: listings.tag,
        tagColor: listings.tagColor,
        createdAt: listings.createdAt,
        sellerId: listings.sellerId,
        seller: users.name,
        sellerAvatar: users.avatar,
        sellerAvatarBg: users.avatarBg,
        sellerVerified: users.verified,
        sellerRating: users.rating,
        sellerSales: users.totalSales,
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.id, id))
      .limit(1);

    if (!rows.length) return res.status(404).json({ error: 'Listing not found' });

    const listing = rows[0];

    // Fetch reviews
    const listingReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        text: reviews.text,
        createdAt: reviews.createdAt,
        reviewerName: users.name,
        reviewerAvatar: users.avatar,
        reviewerAvatarBg: users.avatarBg,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.listingId, id))
      .orderBy(sql`${reviews.createdAt} DESC`);

    // Avg rating
    const [stats] = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.listingId, id));

    // Related listings (same category, different id)
    const related = await db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        originalPrice: listings.originalPrice,
        condition: listings.condition,
        image: listings.image,
        tag: listings.tag,
        tagColor: listings.tagColor,
        seller: users.name,
        sellerAvatar: users.avatar,
        sellerAvatarBg: users.avatarBg,
        sellerVerified: users.verified,
        sellerRating: users.rating,
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(sql`${listings.category} = ${listing.category} AND ${listings.id} != ${id} AND ${listings.active} = 1`)
      .limit(3);

    res.json({
      ...listing,
      images: [listing.image],
      postedAt: listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently',
      rating: parseFloat(String(stats?.avg ?? 4.5)).toFixed(1),
      reviews: listingReviews,
      reviewCount: stats?.count ?? 0,
      related: related.map(r => ({
        ...r,
        rating: '4.5',
        reviews: 0,
        saved: false,
        postedAt: 'Recently',
      })),
    });
  } catch (error) {
    console.error('GET /api/listings/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch listing', message: String(error) });
  }
}
