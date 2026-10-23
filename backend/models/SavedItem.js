import mongoose from 'mongoose';

const savedItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SavedItem || mongoose.model('SavedItem', savedItemSchema);
