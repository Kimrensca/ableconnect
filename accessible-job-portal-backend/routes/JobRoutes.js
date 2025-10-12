import express from 'express';
import authenticate from '../middleware/authenticate.js';
import Job from '../models/Job.js';
import User from '../models/User.js'; // Ensure this is imported
import Application from '../models/Application.js';

const router = express.Router();

// @route POST /api/jobs
// @desc  Employer posts a new job
// @access Private
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      salary,
      type,
      disabilityFriendly,
      accessibility,
      aboutCompany,
      requirements,
      category,
    } = req.body;

    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can post jobs' });
    }

    // Fetch the user's company profile and use it as the primary company name
    const user = await User.findById(req.user.id).select('companyProfile');
    const company = user.companyProfile?.name || req.body.company || 'Unnamed Company';
    console.log('Posting job with company:', company); // Debug the chosen company

    if (!company) {
      return res.status(400).json({ message: 'Company name is required. Please set your company profile.' });
    }

    const job = new Job({
      title,
      description,
      location,
      salary: salary ? parseFloat(salary) : null,
      type,
      disabilityFriendly,
      company,
      accessibility: accessibility || [],
      aboutCompany: aboutCompany || '',
      requirements,
      category,
      postedBy: req.user.id,
    });

    await job.save();
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (err) {
    console.error("Error in POST /api/jobs:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/employer', authenticate, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route PUT /api/jobs/:id
// @desc Update a job
// @access Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    console.log('User ID:', req.user.id, 'Job postedBy:', job.postedBy.toString());
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own jobs' });
    }

    const { title, description, location, type, salary, disabilityFriendly, status, company } = req.body;
    job.title = title !== undefined ? title : job.title;
    job.description = description !== undefined ? description : job.description;
    job.location = location !== undefined ? location : job.location;
    job.type = type !== undefined ? type : job.type;
    job.salary = salary !== undefined ? salary : job.salary;
    job.disabilityFriendly = disabilityFriendly !== undefined ? disabilityFriendly : job.disabilityFriendly;
    job.status = status !== undefined ? status : job.status;
    job.company = company !== undefined ? company : job.company; // Ensure company updates

    const updatedJob = await job.save();
    console.log('Job updated successfully:', updatedJob);
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job || job.postedBy.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'Job deleted' });
});

router.get('/', async (req, res) => {
  try {
    const filters = {};
    const { type, disabilityFriendly, location, search } = req.query;
    if (type && type !== 'All') {
      filters.type = type;
    }
    if (disabilityFriendly === 'true') {
      filters.disabilityFriendly = true;
    }
    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    console.log("🔎 Filters applied:", filters);
    const jobs = await Job.find(filters).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:jobId/save', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only jobseekers can save jobs' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(req.user.id);
    const isSaved = user.savedJobs.includes(job._id);

    if (isSaved) {
      user.savedJobs.pull(job._id); // Remove if already saved
      await user.save();
      return res.json({ message: 'Job removed from saved jobs', saved: false });
    } else {
      user.savedJobs.push(job._id); // Add if not saved
      await user.save();
      return res.json({ message: 'Job saved successfully', saved: true });
    }
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/apply/:jobId', authenticate, async (req, res) => {
  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Only job seekers can apply.' });
  }
  const existing = await Application.findOne({
    jobId: req.params.jobId,
    applicantId: req.user.id,
  });
  if (existing) {
    return res.status(400).json({ message: 'Already applied.' });
  }
  const app = new Application({
    jobId: req.params.jobId,
    applicantId: req.user.id,
  });
  await app.save();
  res.json({ message: 'Application submitted.' });
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('❌ Error fetching job by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;