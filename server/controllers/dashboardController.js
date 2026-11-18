import User from '../models/User.js';
import Record from '../models/Record.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, inactiveUsers, totalRecords, recentUsers, recentRecords, roleStats] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'inactive' }),
    Record.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5),
    Record.find().populate('createdBy', 'name').sort({ createdAt: -1 }).limit(5),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
  ]);
  res.json({
    success: true,
    data: { totalUsers, activeUsers, inactiveUsers, totalRecords, recentUsers, recentRecords, usersByRole: roleStats }
  });
});
