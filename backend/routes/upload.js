import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl) return res.status(400).json({ message: 'dataUrl required' });

    return res.json({
      url: dataUrl,
      publicUrl: dataUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
