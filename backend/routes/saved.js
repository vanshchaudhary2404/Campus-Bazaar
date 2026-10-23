import express from 'express';
import SavedItem from '../models/SavedItem.js';
import Listing from '../models/Listing.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.json([]);

    const savedItems = await SavedItem.find({ userId }).lean();
    const listingIds = savedItems.map((entry) => entry.listingId);
    const listings = await Listing.find({ _id: { $in: listingIds } }).lean();

    return res.json(listings.map((listing) => ({
      id: Number(listing._id.toString().slice(-6, -1)) || 1,
      title: listing.title,
      price: listing.price,
      originalPrice: listing.price,
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      image: listing.images?.[0] || '/assets/default-listing.jpg',
      tag: null,
      tagColor: null,
      createdAt: listing.createdAt,
      seller: 'Campus User',
      sellerAvatar: '',
      sellerAvatarBg: '#4f46e5',
      sellerVerified: true,
      sellerRating: '4.8',
      rating: '4.8',
      reviews: 0,
      saved: true,
      description: listing.description,
      images: listing.images || [],
    })));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
