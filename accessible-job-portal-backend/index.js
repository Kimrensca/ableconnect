import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/JobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminroutes.js';
import contentRoutes from './routes/contentRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js'; 

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.use('/api/content', contentRoutes); // New route for content like announcements

app.use('/api/admin', adminRoutes);

app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));