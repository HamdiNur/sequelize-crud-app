const AppError = require("../utils/appError");

const sendErrorDev = (error, res) => {
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message,
    stack: error.stack,        // ✅ show stack for debugging
    error                      // ✅ show the full error object
  });
};

const sendErrorProd = (error, res) => {
  // If it's an operational error we created (AppError)
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  }

  // If it's Sequelize validation or DB error
  if (error.name === 'SequelizeValidationError') {
    const message = error.errors.map(e => e.message).join(', ');
    return res.status(400).json({
      status: 'fail',
      message
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 'fail',
      message: error.errors[0].message || 'Duplicate field value'
    });
  }

  // Otherwise, unknown error → still show details so you’re not confused
  return res.status(500).json({
    status: 'error',
    message: error.message || 'Internal Server Error',
    stack: error.stack
  });
};

const globalErrorHandler = (err, req, res, next) => {
  // Sequelize validation errors
  if(err.name=='jsonWebTokenError'){
    err=new AppError('Invalid token',401)
  }
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    err = new AppError(message, 400);
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    err = new AppError(err.errors[0].message || 'Duplicate field value', 400);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  return sendErrorProd(err, res);
};


module.exports = globalErrorHandler;
