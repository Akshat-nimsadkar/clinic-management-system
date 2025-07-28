export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Default error
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  }

  // Firebase Admin errors
  if (err.code && err.code.startsWith('auth/')) {
    error.statusCode = 401
    error.message = 'Authentication error'
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.statusCode = 400
    error.message = 'Validation Error'
    error.details = Object.values(err.errors).map(val => val.message)
  }

  // Duplicate key error
  if (err.code === 11000) {
    error.statusCode = 400
    error.message = 'Duplicate field value entered'
  }

  // Cast error
  if (err.name === 'CastError') {
    error.statusCode = 400
    error.message = 'Resource not found'
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}