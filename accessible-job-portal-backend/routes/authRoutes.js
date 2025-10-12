import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);  // New: Send reset link
router.post('/reset-password/:token', resetPassword);  // New: Handle password reset

export default router;
