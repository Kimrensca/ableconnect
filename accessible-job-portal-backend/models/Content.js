import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  category: { type: String, required: true, enum: ['Homepage', 'FAQ', 'Guidelines', 'Announcements', 'Guides', 'Other'], default: 'Other' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
});

contentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Content', contentSchema);