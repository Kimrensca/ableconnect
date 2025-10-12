import express from "express";
import { updateApplicationStatus } from "../controllers/applicationContoller.js";
import authenticate from "../middleware/authenticate.js";
import Application from "../models/Application.js";
import upload from "../middleware/upload.js";
import path from "path";
import fs from "fs/promises";
import Job from "../models/Job.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

// Employer profile update (legacy route)
router.put("/employers/profile", authenticate, upload.none(), async (req, res) => {
  if (req.user.role !== "employer") return res.status(403).json({ message: "Only employers can update this." });
  try {
    const { username, companyName, email, phone, location, website } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.trim();
    }

    if (username && username.trim() && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username already in use" });
      }
      user.username = username.trim();
    } else if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (companyName && companyName.trim()) user.companyProfile.name = companyName.trim();
    else return res.status(400).json({ message: "Company Name is required" });

    if (phone) user.phone = phone.trim();
    if (location) user.location = location.trim();
    if (website) user.companyProfile.website = website.trim();

    await user.save();
    res.json({
      username: user.username,
      companyName: user.companyProfile.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      website: user.companyProfile.website,
    });
  } catch (error) {
    console.error("Error updating employer profile:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

// GET all applications for an employer
router.get("/employer", authenticate, async (req, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Only employers can view applications." });
  }
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).select("_id");
    const jobIds = jobs.map((job) => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate("applicantId", "email name")
      .populate("jobId", "_id title");
    const transformedApps = applications.map((app) => ({
      ...app.toObject(),
      resume: app.resume ? path.basename(app.resume) : null,
      certificate: app.certificate ? path.basename(app.certificate) : null,
      background: Array.isArray(app.background) ? app.background : app.background ? [app.background] : [],
      experience: Array.isArray(app.experience) ? app.experience : app.experience ? [app.experience] : [],
    }));
    res.json(transformedApps);
  } catch (error) {
    console.error("❌ Error fetching employer applications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET company profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can view their profile" });
    }
    const user = await User.findById(req.user.id).select("companyProfile username email phone location");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = user.companyProfile || {};
    let accommodations = profile.accommodations || [];
    if (Array.isArray(accommodations) && accommodations.every((item) => typeof item === "string")) {
      accommodations = accommodations.map((name) => ({ name, available: true }));
    } else if (typeof accommodations === "string") {
      accommodations = accommodations.split(",").map((name) => ({ name: name.trim(), available: true }));
    } else if (!Array.isArray(accommodations)) {
      accommodations = [];
    }
    const accommodationsAvailable = profile.accommodationsAvailable !== undefined ? profile.accommodationsAvailable : false;
    res.json({
      username: user.username,
      companyName: profile.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      website: profile.website || "",
      industry: profile.industry || "",
      size: profile.size || "",
      inclusionStatement: profile.inclusionStatement || "",
      accommodations,
      accommodationsAvailable,
    });
  } catch (error) {
    console.error("❌ Error fetching company profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE company profile
router.put("/profile", authenticate, upload.none(), async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can update their profile" });
    }
    const { companyName, website, industry, size, inclusionStatement, accommodations, accommodationsAvailable, username, email, phone, location } = req.body;
    console.log("Updating profile for user:", req.user.id, "with data:", req.body);

    // Initialize companyProfile if undefined
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.companyProfile) {
      user.companyProfile = {};
    }

    // Validate and update username
    if (username && username.trim() && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username already in use" });
      }
      user.username = username.trim();
    } else if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Validate and update email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.trim();
    }

    // Parse accommodations
    let normalizedAccommodations = [];
    if (accommodations) {
      try {
        const parsedAccommodations = typeof accommodations === "string" ? JSON.parse(accommodations) : accommodations;
        if (Array.isArray(parsedAccommodations)) {
          normalizedAccommodations = parsedAccommodations.map((item) => {
            if (typeof item === "string") {
              return { name: item.trim(), available: true };
            } else if (typeof item === "object" && item.name && typeof item.available === "boolean") {
              return { name: item.name.trim(), available: item.available };
            }
            return null;
          }).filter((item) => item !== null);
        } else if (typeof parsedAccommodations === "string") {
          normalizedAccommodations = parsedAccommodations.split(",").map((name) => ({ name: name.trim(), available: true }));
        }
      } catch (error) {
        console.error("❌ Error parsing accommodations:", error);
        return res.status(400).json({ message: "Invalid accommodations format" });
      }
    }

    // Validate companyName
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ message: "Company Name is required" });
    }

    // Prepare update data
    const updateData = {
      username: user.username,
      email: user.email,
      phone: phone ? phone.trim() : user.phone,
      location: location ? location.trim() : user.location,
      "companyProfile.name": companyName ? companyName.trim() : user.companyProfile.name,
      "companyProfile.website": website ? website.trim() : user.companyProfile.website,
      "companyProfile.industry": industry ? industry.trim() : user.companyProfile.industry,
      "companyProfile.size": size ? size.trim() : user.companyProfile.size,
      "companyProfile.inclusionStatement": inclusionStatement ? inclusionStatement.trim() : user.companyProfile.inclusionStatement,
      "companyProfile.accommodations": normalizedAccommodations,
      "companyProfile.accommodationsAvailable": Boolean(accommodationsAvailable),
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("companyProfile username email phone location");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update" });
    }

    console.log("Updated profile in DB:", updatedUser.companyProfile);
    res.json({
      username: updatedUser.username,
      companyName: updatedUser.companyProfile.name || "",
      email: updatedUser.email || "",
      phone: updatedUser.phone || "",
      location: updatedUser.location || "",
      website: updatedUser.companyProfile.website || "",
      industry: updatedUser.companyProfile.industry || "",
      size: updatedUser.companyProfile.size || "",
      inclusionStatement: updatedUser.companyProfile.inclusionStatement || "",
      accommodations: updatedUser.companyProfile.accommodations || [],
      accommodationsAvailable: updatedUser.companyProfile.accommodationsAvailable || false,
    });
  } catch (error) {
    console.error("❌ Error updating company profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET job seeker profile
router.get("/jobseeker/profile", authenticate, async (req, res) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "Only job seekers can access this." });
  }
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching job seeker profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE job seeker profile with resume
router.put("/jobseeker/profile", authenticate, upload.single("resume"), async (req, res) => {
  if (req.user.role !== "jobseeker") return res.status(403).json({ message: "Only job seekers can update this." });
  try {
    const { username, name, email, phone, location } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (username && username.trim() && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username already in use" });
      }
      user.username = username.trim();
    } else if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (name && name.trim()) user.name = name.trim();
    else return res.status(400).json({ message: "Name is required" });

    if (phone) user.phone = phone.trim();
    if (location) user.location = location.trim();

    if (req.file) {
      if (user.resume?.filename) {
        const oldResumePath = path.join(__dirname, "../Uploads/resumes", user.resume.filename);
        try {
          await fs.access(oldResumePath);
          await fs.unlink(oldResumePath);
        } catch (err) {
          if (err.code !== "ENOENT") console.error(`Error deleting old resume: ${err}`);
        }
      }
      user.resume = {
        filename: req.file.filename,
        url: `/resume/${req.file.filename}`,
        uploadedAt: new Date(),
      };
    }

    await user.save();
    res.json({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      resume: user.resume,
      jobTypes: user.jobTypes,
      preferredLocation: user.preferredLocation,
      desiredSalary: user.desiredSalary,
      accommodationPreferences: user.accommodationPreferences,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error("Error updating job seeker profile:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

// UPDATE job seeker preferences
router.put("/jobseeker/preferences", authenticate, async (req, res) => {
  if (req.user.role !== "jobseeker") return res.status(403).json({ message: "Only job seekers can update this." });
  try {
    const { jobTypes, preferredLocation, desiredSalary } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { jobTypes, preferredLocation, desiredSalary },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    console.error("❌ Error updating job seeker preferences:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE job seeker accommodation
router.put("/jobseeker/accommodation", authenticate, async (req, res) => {
  if (req.user.role !== "jobseeker") return res.status(403).json({ message: "Only job seekers can update this." });
  try {
    const { accommodationPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { accommodationPreferences },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    console.error("❌ Error updating job seeker accommodation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all applications for a job seeker
router.get("/jobseeker", authenticate, async (req, res) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "Only job seekers can view this." });
  }
  try {
    const apps = await Application.find({ applicantId: req.user.id }).populate("jobId");
    const transformedApps = apps.map((app) => ({
      ...app.toObject(),
      resume: app.resume ? path.basename(app.resume) : null,
      certificate: app.certificate ? path.basename(app.certificate) : null,
      background: Array.isArray(app.background) ? app.background : app.background ? [app.background] : [],
      experience: Array.isArray(app.experience) ? app.experience : app.experience ? [app.experience] : [],
    }));
    res.json(transformedApps);
  } catch (error) {
    console.error("❌ Error fetching applications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Get all applications for an employer for a specific job
router.get('/employer/:jobId', authenticate, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Only employers can view applicants.' });
  }
  try {
    const jobId = req.params.jobId;
    if (!jobId || jobId === 'undefined') {
      console.error('❌ Invalid or undefined jobId:', jobId);
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const apps = await Application.find({ jobId: job._id }).populate('applicantId', 'email name').populate('jobId', '_id title');
    const transformedApps = apps.map((app) => ({
      ...app.toObject(),
      resume: app.resume ? path.basename(app.resume) : null,
      certificate: app.certificate ? path.basename(app.certificate) : null,
      background: Array.isArray(app.background) ? app.background : app.background ? [app.background] : [],
      experience: Array.isArray(app.experience) ? app.experience : app.experience ? [app.experience] : [],
    }));
    res.json(transformedApps);
  } catch (error) {
    console.error('❌ Error fetching employer applications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single application by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('applicantId');
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (req.user.role === 'employer') {
      const job = await Job.findById(app.jobId);
      if (!job || job.postedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    } else if (req.user.role === 'jobseeker') {
      if (app.applicantId._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }
    const transformedApp = {
      ...app.toObject(),
      resume: app.resume ? path.basename(app.resume) : null,
      certificate: app.certificate ? path.basename(app.certificate) : null,
      background: Array.isArray(app.background) ? app.background : app.background ? [app.background] : [],
      experience: Array.isArray(app.experience) ? app.experience : app.experience ? [app.experience] : [],
    };
    console.log("Transformed app for GET /:id:", transformedApp);
    res.json(transformedApp);
  } catch (err) {
    console.error('❌ Error fetching application:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Submit application with resume and certificate
router.post(
  "/",
  authenticate,
  upload.fields([{ name: "resume" }, { name: "certificate" }]),
  async (req, res) => {
    try {
      const {
        jobId, name, email, phone, bio, background, experience, coverLetter, accommodation,
      } = req.body;
      const applicantId = req.user.id;
      if (!jobId || !name || !email) {
        return res.status(400).json({ message: "Job ID, name, and email are required" });
      }
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const resume = req.files["resume"] ? req.files["resume"][0].filename : null;
      const certificate = req.files["certificate"] ? req.files["certificate"][0].filename : null;

      // Normalize background and experience to arrays
      const normalizedBackground = Array.isArray(background)
        ? background.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())
        : typeof background === 'string' && background.trim()
        ? [background.trim()]
        : [];
      const normalizedExperience = Array.isArray(experience)
        ? experience.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())
        : typeof experience === 'string' && experience.trim()
        ? [experience.trim()]
        : [];

      const application = new Application({
        jobId,
        applicantId,
        name,
        email,
        phone: phone || "",
        bio: bio || "",
        background: normalizedBackground,
        experience: normalizedExperience,
        coverLetter: coverLetter || "",
        accommodation: accommodation || "",
        resume,
        certificate,
        status: "Pending",
      });
      await application.save();
      res.status(201).json({ message: "Application submitted successfully", data: application });
    } catch (err) {
      console.error("❌ Error applying for job:", err);
      res.status(500).json({ message: "Error applying for job", error: err.message });
    }
  }
);

// Download resume (secured with authentication)
router.get("/resume/:filename", authenticate, async (req, res) => {
  const baseDir = path.resolve("./Uploads/resumes");
  const filePath = path.join(baseDir, req.params.filename);
  console.log("Request URL:", req.originalUrl);
  console.log("Attempting to access file at:", filePath);
  try {
    await fs.access(filePath);
    const isView = req.query.view === "true";
    if (isView) {
      res.setHeader("Content-Disposition", "inline");
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      return res.sendFile(filePath);
    } else {
      res.download(filePath, req.params.filename, (err) => {
        if (err) {
          console.error("Error downloading file:", req.params.filename, err);
          res.status(500).json({ message: "Internal server error while downloading", error: err.message });
        }
      });
    }
  } catch (err) {
    console.error("File access error for", req.params.filename, ":", err.message);
    res.status(404).json({ message: "Resume not found", error: err.message });
  }
});

// Download certificate (secured with authentication)
router.get("/certificate/:filename", authenticate, async (req, res) => {
  const baseDir = path.resolve("./Uploads/certificates");
  const filePath = path.join(baseDir, req.params.filename);
  console.log("Request URL for certificate:", req.originalUrl);
  console.log("Attempting to access file at:", filePath);
  try {
    await fs.access(filePath);
    const isView = req.query.view === "true";
    if (isView) {
      res.setHeader("Content-Disposition", "inline");
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      return res.sendFile(filePath);
    } else {
      res.download(filePath, req.params.filename, (err) => {
        if (err) {
          console.error("Error downloading certificate:", req.params.filename, err);
          res.status(500).json({ message: "Internal server error while downloading", error: err.message });
        }
      });
    }
  } catch (err) {
    console.error("File access error for", req.params.filename, ":", err.message);
    res.status(404).json({ message: "Certificate not found", error: err.message });
  }
});

// Delete application
router.delete('/:applicationId', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.applicantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await Application.deleteOne({ _id: req.params.applicationId });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET company profile by company name (public)
router.get("/companies/:companyName", async (req, res) => {
  console.log(`🔍 Request for /api/applications/companies/${req.params.companyName}`);
  try {
    const normalizedCompanyName = req.params.companyName.toLowerCase().replace(/-/g, " ");
    console.log(`🔎 Querying User with normalized companyProfile.name: ${normalizedCompanyName}`);
    const user = await User.findOne({
      "companyProfile.name": { $regex: normalizedCompanyName, $options: "i" },
    }).select("companyProfile");
    if (!user) {
      console.log("⚠️ No user found with matching companyProfile.name");
      const profiles = await User.find().select("companyProfile.name");
      console.log("🔎 Existing companyProfile.names:", profiles.map((p) => p.companyProfile?.name));
      return res.status(404).json({ message: "No user found with that company name" });
    }
    if (!user.companyProfile) {
      console.log("⚠️ User found but no companyProfile exists");
      return res.status(404).json({ message: "Company profile not set" });
    }
    let accommodations = user.companyProfile.accommodations || [];
    if (Array.isArray(accommodations) && accommodations.every((item) => typeof item === "string")) {
      accommodations = accommodations.map((name) => ({ name, available: true }));
    } else if (typeof accommodations === "string") {
      accommodations = accommodations.split(",").map((name) => ({ name: name.trim(), available: true }));
    }
    const profile = {
      ...user.companyProfile.toObject(),
      accommodations,
      accommodationsAvailable:
        user.companyProfile.accommodationsAvailable !== undefined ? user.companyProfile.accommodationsAvailable : false,
    };
    console.log("✅ Returning company profile:", profile);
    res.json(profile);
  } catch (error) {
    console.error("❌ Error fetching company profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/applications/:id/status
router.put("/:id/status", authenticate, updateApplicationStatus);

// Test route
router.get("/test", (req, res) => {
  console.log("✅ applicationRoutes loaded and test route hit");
  res.send("Test route working");
});

export default router;