export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

export default function errorHandler(error, req, res, next) {
  let status = res.statusCode >= 400 ? res.statusCode : error.statusCode || 500;
  const response = { success: false, message: error.message || 'Internal server error' };
  if (error.errors) response.errors = error.errors;
  if (error.name === 'ValidationError') {
    status = 400;
    response.message = 'Validation failed';
    response.errors = Object.values(error.errors).map(({ path, message }) => ({ field: path, message }));
  } else if (error.code === 11000) {
    status = 409;
    response.message = 'A user with this email already exists';
    response.errors = [{ field: Object.keys(error.keyPattern || {})[0], message: 'Already in use' }];
  } else if (error.name === 'CastError') {
    status = 400;
    response.message = 'Invalid resource identifier';
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    status = 401;
    response.message = 'Invalid or expired session';
  }
  if (status >= 500) console.error(error);
  res.status(status).json(response);
}
