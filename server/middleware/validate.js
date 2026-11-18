import { validationResult } from 'express-validator';

export default function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields',
      errors: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }
  next();
}
