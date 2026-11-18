import { Router } from 'express';
import { body, param } from 'express-validator';
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '../controllers/recordController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = Router();
const idRule = param('id').isMongoId().withMessage('Invalid record identifier');
const fields = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }).withMessage('Title is too long'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description is too long'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ max: 80 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be zero or greater'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
];

router.use(authMiddleware);
router.get('/', listRecords);
router.get('/:id', idRule, validate, getRecord);
router.post('/', fields, validate, createRecord);
router.put('/:id', [idRule, ...fields], validate, updateRecord);
router.delete('/:id', idRule, validate, deleteRecord);

export default router;
