import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, default: '/assets/default-listing.jpg' },
    images: [{ type: String }],
    tag: { type: String, default: null },
    tagColor: { type: String, default: null },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: { type: String, default: 'Campus User' },
    sellerAvatar: { type: String, default: '' },
    sellerAvatarBg: { type: String, default: '#4f46e5' },
    sellerVerified: { type: Boolean, default: true },
    sellerRating: { type: String, default: '4.8' },
    rating: { type: String, default: '4.8' },
    reviews: { type: Number, default: 0 },
    saved: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Listing || mongoose.model('Listing', listingSchema);
