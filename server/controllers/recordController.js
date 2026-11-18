import Record from '../models/Record.js';
import asyncHandler from '../middleware/asyncHandler.js';
import escapeRegex from '../utils/escapeRegex.js';

export const listRecords = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const allowedSort = ['title', 'category', 'price', 'status', 'createdAt'];
  const sortBy = allowedSort.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const query = {};
  if (req.query.search) {
    const search = escapeRegex(String(req.query.search).trim());
    query.$or = ['title', 'description', 'category'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
  }
  if (['active', 'inactive'].includes(req.query.status)) query.status = req.query.status;
  const [records, total] = await Promise.all([
    Record.find(query).populate('createdBy', 'name email').sort({ [sortBy]: sortOrder }).skip((page - 1) * limit).limit(limit),
    Record.countDocuments(query)
  ]);
  res.json({ success: true, data: { records, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const getRecord = asyncHandler(async (req, res) => {
  const record = await Record.findById(req.params.id).populate('createdBy', 'name email');
  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }
  res.json({ success: true, data: { record } });
});

export const createRecord = asyncHandler(async (req, res) => {
  const record = await Record.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, message: 'Record created', data: { record } });
});

export const updateRecord = asyncHandler(async (req, res) => {
  const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('createdBy', 'name email');
  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }
  res.json({ success: true, message: 'Record updated', data: { record } });
});

export const deleteRecord = asyncHandler(async (req, res) => {
  const record = await Record.findByIdAndDelete(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }
  res.json({ success: true, message: 'Record deleted' });
});
