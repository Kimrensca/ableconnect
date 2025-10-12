import express from "express";
import multer from "multer";
import User from "../models/User.js";

const router = express.Router();

// Multer storage (local uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload resume
router.post("/:userId/resume", upload.single("resume"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.resume = {
      filename: req.file.filename,
      url: `/uploads/resumes/${req.file.filename}`,
    };

    await user.save();
    res.json({ message: "Resume uploaded", resume: user.resume });
  } catch (err) {
    res.status(500).json({ message: "Error uploading resume", error: err });
  }
});

export default router;
