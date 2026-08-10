/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and sends a clean JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum allowed file size is 10 MB.',
    });
  }

  // Multer file type error
  if (err.message && err.message.includes('Only Excel files')) {
    return res.status(400).json({
      error: err.message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication token has expired.',
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'A record with this information already exists.',
    });
  }

  // PostgreSQL authentication failure (password wrong)
  if (err.code === '28P01' || err.message?.includes('password authentication failed')) {
    return res.status(500).json({
      error: 'Database connection failed: Incorrect PostgreSQL password in backend/.env.',
    });
  }

  // PostgreSQL database does not exist
  if (err.code === '3D000' || (err.message?.includes('database') && err.message?.includes('does not exist'))) {
    return res.status(500).json({
      error: 'Database error: The database specified in backend/.env does not exist.',
    });
  }

  // PostgreSQL server unreachable
  if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED')) {
    return res.status(503).json({
      error: 'Database error: Could not connect to PostgreSQL server.',
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message || 'Internal server error.';

  res.status(statusCode).json({ error: message });
};

module.exports = { errorHandler };
