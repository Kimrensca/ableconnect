import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    bio: String,
    background: { type: [String], default: [] },
    experience: { type: [String], default: [] },
    coverLetter: String,
    accommodation: String,
    hasSpecialNeed: { type: Boolean, default: false },
    specialNeedDetails: { type: String },

    resume: String, // URL or path to the resume file
    certificate: String, // Path to certificate file
    feedback: String,
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Interview Scheduled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);