// middleware/authorizeAdmin.js (updated)
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authorizeAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log
    const user = await User.findById(decoded.id); // Changed from decoded.userId to decoded.id

    if (!user || user.role !== 'admin') {
      throw new Error('Not authorized as admin');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authorization error:', error); // Debug log
    res.status(401).json({ message: 'Not authorized as admin', error: error.message });
  }
};

export default authorizeAdmin;