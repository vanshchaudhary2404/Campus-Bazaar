import express from 'express';
import User from '../models/User.js';
import PointsLedger from '../models/PointsLedger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const history = await PointsLedger.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();

    return res.json({
      balance: Number(user.points || 0),
      history: history.map((entry) => ({
        ...entry,
        userId: String(entry.userId),
        id: String(entry._id),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
