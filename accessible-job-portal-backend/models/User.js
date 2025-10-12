// models/User.js
import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  available: { type: Boolean, default: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  phone: String,
  location: String,
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  jobTypes: [String],
  preferredLocation: String,
  desiredSalary: String,
  accommodationPreferences: String,
  resume: {
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  role: { type: String, enum: ['admin', 'jobseeker', 'employer'], default: 'jobseeker' }, 
  approved: { type: Boolean, default: false }, 
  suspended: { type: Boolean, default: false }, 
  resetToken: String,
  resetTokenExpiry: Date,

  companyProfile: {
    name: String,
    website: String,
    industry: String,
    size: String,
    inclusionStatement: String,
    accommodations: [accommodationSchema],
    accommodationsAvailable: { type: Boolean, default: false },
  },
});

export default mongoose.model('User', userSchema);