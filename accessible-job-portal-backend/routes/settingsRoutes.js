import express from 'express';
import UserSettings from '../models/UserSettings.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// ✅ GET can be public (no authenticate)
router.get('/', async (req, res) => {
  try {
    // Optional: detect user if token exists, but don't force it
    let userId = req.user?.id;

    if (userId) {
      let settings = await UserSettings.findOne({ userId });
      if (!settings) {
        settings = new UserSettings({ userId });
        await settings.save();
      }
      return res.json(settings);
    }

    // If not logged in → return default guest settings
    res.json({
      tts: { voice: '', rate: 1, volume: 1 },
      notifications: { jobAlerts: false, announcements: true },
      fontSize: 16,
      highContrast: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ PUT still requires authentication
router.put('/', authenticate, async (req, res) => {
  try {
    const { tts, notifications, fontSize, highContrast } = req.body;
    let settings = await UserSettings.findOne({ userId: req.user.id });
    if (!settings) {
      settings = new UserSettings({ userId: req.user.id });
    }
    settings.tts = tts || settings.tts;
    settings.notifications = notifications || settings.notifications;
    settings.fontSize = fontSize ?? settings.fontSize;
    settings.highContrast = highContrast ?? settings.highContrast;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
