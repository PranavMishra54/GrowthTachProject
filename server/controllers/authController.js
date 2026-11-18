import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

function setSessionCookie(res, user) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  setSessionCookie(res, user);
  res.status(201).json({ success: true, message: 'Account created', data: { user } });
});

async function login(req, res, adminOnly = false) {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.status !== 'active') {
    res.status(403);
    throw new Error('This account is inactive. Contact an administrator.');
  }
  if (adminOnly && user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required');
  }
  user.lastLogin = new Date();
  await user.save();
  setSessionCookie(res, user);
  res.json({ success: true, message: 'Signed in successfully', data: { user } });
}

export const loginUser = asyncHandler((req, res) => login(req, res));
export const adminLogin = asyncHandler((req, res) => login(req, res, true));

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Signed out successfully' });
};

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
