import { Router } from 'express';
import { body, param } from 'express-validator';
import { createUser, deleteUser, getUser, listUsers, updateUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();
const idRule = param('id').isMongoId().withMessage('Invalid user identifier');
const emailRule = body('email').optional().isEmail().withMessage('Enter a valid email address').normalizeEmail();
const passwordRule = body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
  .matches(/[0-9]/).withMessage('Password must contain a number');
const roleRule = body('role').optional().isIn(['user', 'manager', 'admin']).withMessage('Invalid role');
const statusRule = body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status');

router.use(authMiddleware);
router.get('/', roleMiddleware('admin', 'manager'), listUsers);
router.get('/:id', roleMiddleware('admin', 'manager'), idRule, validate, getUser);
router.post('/', roleMiddleware('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  passwordRule,
  body('role').optional().isIn(['user', 'manager', 'admin']),
  body('status').optional().isIn(['active', 'inactive'])
], validate, createUser);
router.put('/:id', roleMiddleware('admin'), [
  idRule,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }),
  emailRule,
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/[A-Za-z]/).withMessage('Password must contain a letter').matches(/[0-9]/).withMessage('Password must contain a number'),
  roleRule,
  statusRule
], validate, updateUser);
router.delete('/:id', roleMiddleware('admin'), idRule, validate, deleteUser);

export default router;
