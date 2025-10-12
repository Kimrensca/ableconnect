// routes/jobseeker.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
const router = express.Router();

// GET Profile
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('savedJobs');
  res.json(user);
});

// UPDATE Profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email, phone, location } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, phone, location },
    { new: true }
  );
  res.json(user);
});

// Update saved jobs
router.put('/savedJobs', authMiddleware, async (req, res) => {
  const { savedJobs } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { savedJobs }, { new: true }).populate('savedJobs');
  res.json(user.savedJobs);
});

export default router;
