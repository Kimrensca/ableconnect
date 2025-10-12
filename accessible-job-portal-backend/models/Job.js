import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  salary: String,
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
    default: 'Full-time',
  },
  disabilityFriendly: Boolean,
  company: { type: String, required: true },
  accessibility: [{ type: String }], // Changed to array
  aboutCompany: String,
  requirements: String,
  category: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Closed'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;