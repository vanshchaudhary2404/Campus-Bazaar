import express from 'express';
import Listing from '../models/Listing.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const mapListing = (listing) => {
  const numericId = Number.parseInt(listing._id.toString().slice(-6), 16) || 1;
  return {
    id: numericId,
    title: listing.title,
    price: Number(listing.price || 0),
    originalPrice: Number(listing.originalPrice || listing.price || 0),
    category: listing.category,
    condition: listing.condition,
    location: listing.location,
    image: listing.image || listing.images?.[0] || '/assets/default-listing.jpg',
    tag: listing.tag ?? null,
    tagColor: listing.tagColor ?? null,
    createdAt: listing.createdAt,
    seller: listing.sellerName || 'Campus User',
    sellerAvatar: listing.sellerAvatar || '',
    sellerAvatarBg: listing.sellerAvatarBg || '#4f46e5',
    sellerVerified: listing.sellerVerified ?? true,
    sellerRating: listing.sellerRating || '4.8',
    sellerSales: 0,
    rating: listing.rating || '4.8',
    reviews: Number(listing.reviews || 0),
    reviewCount: Number(listing.reviews || 0),
    saved: !!listing.saved,
    description: listing.description,
    images: listing.images || [listing.image || '/assets/default-listing.jpg'],
    related: [],
    postedAt: listing.createdAt,
  };
};

router.get('/', async (req, res) => {
  try {
    const { category, search, condition, minPrice, maxPrice, sort = 'newest' } = req.query;
    const query = { active: true };

    if (category && category !== 'All') query.category = String(category);
    if (condition) query.condition = String(condition);
    if (search) query.title = { $regex: String(search), $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    const limit = 50;
    const listings = await Listing.find(query).sort(sortMap[sort] || sortMap.newest).limit(limit).lean();
    res.json({ listings: listings.map(mapListing), total: listings.length, page: 1, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    return res.json(mapListing(listing));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      originalPrice: req.body.originalPrice || req.body.price,
      image: req.body.image || '/assets/default-listing.jpg',
      images: req.body.images || [req.body.image || '/assets/default-listing.jpg'],
      seller: req.body.seller || req.user?.id || '000000000000000000000000',
      sellerName: req.body.sellerName || 'Campus User',
      sellerAvatar: req.body.sellerAvatar || '',
      sellerAvatarBg: req.body.sellerAvatarBg || '#4f46e5',
      sellerVerified: req.body.sellerVerified ?? true,
      sellerRating: req.body.sellerRating || '4.8',
      rating: req.body.rating || '4.8',
      reviews: Number(req.body.reviews || 0),
      saved: !!req.body.saved,
      active: true,
      isActive: true,
    });
    return res.status(201).json(mapListing(listing));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/:id/save', async (req, res) => {
  try {
    return res.json({ saved: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id/reviews', async (req, res) => {
  return res.json([]);
});

router.post('/:id/reviews', async (req, res) => {
  const { rating = 5, text = '' } = req.body || {};
  return res.status(201).json({
    id: Date.now(),
    rating: Number(rating),
    text,
    createdAt: new Date().toISOString(),
    reviewerName: 'Campus User',
    reviewerAvatar: '',
    reviewerAvatarBg: '#4f46e5',
  });
});

router.post('/:id/sold', async (req, res) => {
  try {
    const { sellerUserId } = req.body || {};
    return res.json({ success: true, pointsAwarded: 10, sellerUserId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
