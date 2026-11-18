import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';

const authMiddleware = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.token || bearer;
  if (!token) {
    res.status(401);
    throw new Error('Authentication required');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.status !== 'active') {
    res.status(401);
    throw new Error('Your account is unavailable');
  }
  req.user = user;
  next();
});

export default authMiddleware;
