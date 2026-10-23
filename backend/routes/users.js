import express from 'express';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

const router = express.Router();

router.get('/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email required' });

    const user = await User.findOne({ email: String(email).toLowerCase() }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      avatarBg: user.avatar || '#4f46e5',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id/listings', async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.params.id }).sort({ createdAt: -1 }).lean();
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
      saved: false,
      description: listing.description,
      images: listing.images || [],
    })));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
