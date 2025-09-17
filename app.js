require('dotenv').config();
const express = require("express");
const authRouter = require("./routes/authRoute");
const AppError = require("./utils/appError"); // ✅ import AppError
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Rest API is working'
  });
});

// Auth routes
app.use('/api/v1/auth', authRouter);

// Handle unmatched routes (404)
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
