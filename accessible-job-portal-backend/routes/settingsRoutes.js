import express from 'express';
import UserSettings from '../models/UserSettings.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.id });
    if (!settings) {
      settings = new UserSettings({ userId: req.user.id });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { tts, notifications, fontSize, highContrast } = req.body;
    let settings = await UserSettings.findOne({ userId: req.user.id });
    if (!settings) {
      settings = new UserSettings({ userId: req.user.id });
    }
    settings.tts = tts || settings.tts;
    settings.notifications = notifications || settings.notifications;
    settings.fontSize = fontSize !== undefined ? fontSize : settings.fontSize;
    settings.highContrast = highContrast !== undefined ? highContrast : settings.highContrast;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;