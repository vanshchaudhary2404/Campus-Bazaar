import mongoose from 'mongoose';

const pointsLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, default: 'manual' },
    type: { type: String, enum: ['credit', 'debit'], default: 'credit' },
  },
  { timestamps: true }
);

export default mongoose.models.PointsLedger || mongoose.model('PointsLedger', pointsLedgerSchema);
