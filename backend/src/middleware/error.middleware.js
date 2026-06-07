import ApiError from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid Mongo ID';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  const responsePayload = {
    success: false,
    message
  };

  if (errors.length > 0) {
    responsePayload.errors = errors;
  }

  // Standard logging for unexpected errors
  if (statusCode === 500) {
    console.error('[SERVER ERROR]', err);
  }

  res.status(statusCode).json(responsePayload);
};
