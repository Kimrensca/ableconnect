// routes/adminroutes.js
import express from 'express';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorizeAdmin.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Content from '../models/Content.js';

const router = express.Router();

// List all users
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('email username role approved suspended'); // Explicitly select username
    if (!users.length) {
      return res.status(200).json({ message: 'No users found', users: [] });
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve an employer/jobseeker
router.put('/users/:userId/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    console.log('Approving user with ID:', req.params.userId);
    const user = await User.findById(req.params.userId);
    console.log('User found:', user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log('Current approved status:', user.approved);
    if (user.approved) {
      console.log('Already approved:', user.approved);
      return res.status(400).json({ message: 'User is already approved' });
    }
    user.approved = true;
    console.log('Before save:', user);
    await user.save({ runValidators: false }); // Bypass validation
    console.log('After save:', user);
    res.json({ message: 'User approved', user });
  } catch (error) {
    console.error('Error approving user:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// Suspend/Unsuspend a user
router.put('/users/:userId/suspend', authenticate, authorizeAdmin, async (req, res) => {
  try {
    console.log('Suspending user with ID:', req.params.userId);
    const user = await User.findById(req.params.userId);
    console.log('User found:', user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const currentSuspended = user.suspended;
    user.suspended = !currentSuspended;
    console.log('Before save:', user);
    console.log('Save options:', { runValidators: false }); // Debug option
    const result = await user.save({ runValidators: false });
    console.log('Save result:', result);
    res.json({ message: `User ${user.suspended ? 'suspended' : 'unsuspended'}`, user });
  } catch (error) {
    console.error('Error suspending user:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

router.put('/users/:userId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { email, username, role } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (email) user.email = email;
    if (username) user.username = username;
    if (role && ['jobseeker', 'employer', 'admin'].includes(role)) user.role = role;
    await user.save();
    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an account
router.delete('/users/:userId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.remove();
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List all jobs
router.get('/jobs', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().select('title status postedBy').populate('postedBy', 'email'); // Populate email
    if (!jobs.length) {
      return res.status(200).json({ message: 'No jobs found', jobs: [] });
    }
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve a job
router.put('/jobs/:jobId/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status === 'Approved') return res.status(400).json({ message: 'Job is already approved' });
    job.status = 'Approved';
    await job.save();
    res.json({ message: 'Job approved', job });
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject a job
router.put('/jobs/:jobId/reject', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status === 'Rejected') return res.status(400).json({ message: 'Job is already rejected' });
    job.status = 'Rejected';
    await job.save();
    res.json({ message: 'Job rejected', job });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit a job (basic update)
router.put('/jobs/:jobId', authenticate, authorizeAdmin, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can access this" });
  }
  try {
    const { title, description, company, location, status } = req.body;
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    job.title = title || job.title;
    job.description = description || job.description;
    job.company = company || job.company;
    job.location = location || job.location;
    job.status = status || job.status;
    await job.save();
    res.json({ message: "Job updated", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Remove a job
router.delete('/jobs/:jobId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    console.log('Deleting job with ID:', req.params.jobId); // Debug log
    const job = await Job.findByIdAndDelete(req.params.jobId);
    console.log('Job found and deleted:', job); // Debug log
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Error deleting job:', error.stack); // Include stack trace
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// List all applications
router.get('/applications', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('applicantId', 'email username')
      .populate('jobId', 'title status company');
    if (!applications.length) {
      return res.status(200).json({ message: 'No applications found', applications: [] });
    }
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status
router.put('/applications/:appId/status', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Pending, Accepted, or Rejected' });
    }
    const app = await Application.findById(req.params.appId);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    app.status = status;
    await app.save();
    res.json({ message: 'Application status updated', app });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// feedback endpoint
router.put('/applications/:id/feedback', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { feedback } = req.body;
    const application = await Application.findByIdAndUpdate(req.params.id, { feedback }, { new: true });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports for admin
router.get("/reports", authenticate, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can access this" });
  }
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const hires = await Application.countDocuments({ status: "Accepted" });
    const resumeUploads = await Application.countDocuments({ resume: { $ne: null } });
    const accommodations = await Application.countDocuments({ accommodation: { $ne: "" } });
    const usersByRole = {
      jobseeker: await User.countDocuments({ role: "jobseeker" }),
      employer: await User.countDocuments({ role: "employer" }),
    };
    const jobsByStatus = {
      active: await Job.countDocuments({ status: "Active" }),
      closed: await Job.countDocuments({ status: "Closed" }),
      pending: await Job.countDocuments({ status: "Pending" }),
      approved: await Job.countDocuments({ status: "Approved" }),
      rejected: await Job.countDocuments({ status: "Rejected" }),
    };
    // Optional: Top employers by job count
    const topEmployers = await Job.aggregate([
      { $group: { _id: "$postedBy", jobCount: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { email: "$user.email", company: "$user.companyProfile.name", jobCount: 1 } },
      { $sort: { jobCount: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      hires,
      resumeUploads,
      accommodations,
      usersByRole,
      jobsByStatus,
      topEmployers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// New Content Management Routes
// Get all content entries
router.get('/content', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const content = await Content.find().populate('createdBy', 'email username');
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch content: ${error.message}` });
  }
});

// Create a new content entry
router.post('/content', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, body, category } = req.body;
    if (!title || !body || !category) {
      return res.status(400).json({ message: 'Title, body, and category are required' });
    }
    const content = new Content({
      title,
      body,
      category,
      createdBy: req.user.id,
    });
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: `Failed to create content: ${error.message}` });
  }
});

// Update a content entry
router.put('/content/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, body, category, isPublished } = req.body;
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    if (title) content.title = title;
    if (body) content.body = body;
    if (category) content.category = category;
    if (typeof isPublished === 'boolean') content.isPublished = isPublished;
    await content.save();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: `Failed to update content: ${error.message}` });
  }
});

// Delete a content entry
router.delete('/content/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    await content.deleteOne();
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete content: ${error.message}` });
  }
});





export default router;