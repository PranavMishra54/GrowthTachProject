import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { adminLogin, getMe, loginUser, logout, register } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts. Try again later.' } });
const loginRules = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];
const passwordRule = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
  .matches(/[0-9]/).withMessage('Password must contain a number');

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name is too long'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  passwordRule
], validate, register);
router.post('/login', authLimiter, loginRules, validate, loginUser);
router.post('/admin-login', authLimiter, loginRules, validate, adminLogin);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
