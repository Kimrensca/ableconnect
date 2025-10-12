import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tts: {
    voice: { type: String, default: '' },
    rate: { type: Number, default: 1 },
    volume: { type: Number, default: 1 },
  },
  notifications: {
    jobAlerts: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
  },
  fontSize: { type: Number, default: 0 }, // -2 to 4
  highContrast: { type: Boolean, default: false },
});

export default mongoose.model('UserSettings', userSettingsSchema);