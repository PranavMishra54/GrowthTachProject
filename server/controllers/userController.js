import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import escapeRegex from '../utils/escapeRegex.js';

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const search = String(req.query.search || '').trim();
  const query = {};
  if (search) {
    const pattern = escapeRegex(search);
    query.$or = ['name', 'email'].map((field) => ({ [field]: { $regex: pattern, $options: 'i' } }));
  }
  if (['active', 'inactive'].includes(req.query.status)) query.status = req.query.status;
  if (['user', 'manager', 'admin'].includes(req.query.role)) query.role = req.query.role;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query)
  ]);
  res.json({ success: true, data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: { user } });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, message: 'User created', data: { user } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.id === req.user.id && req.body.status === 'inactive') {
    res.status(400);
    throw new Error('You cannot deactivate your own account');
  }
  for (const field of ['name', 'email', 'role', 'status', 'password']) {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  }
  await user.save();
  res.json({ success: true, message: 'User updated', data: { user } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, message: 'User deleted' });
});
