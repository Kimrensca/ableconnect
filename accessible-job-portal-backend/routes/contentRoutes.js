import express from 'express';
import Content from '../models/Content.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isPublished: true };
    if (category) {
      query.category = { $in: category.split(',') };
    }
    const content = await Content.find(query).populate('createdBy', 'email username');
    res.json(content);
  } catch (error) {
    console.error('Error fetching public content:', error.stack);
    res.status(500).json({ message: `Failed to fetch content: ${error.message}` });
  }
});

export default router;