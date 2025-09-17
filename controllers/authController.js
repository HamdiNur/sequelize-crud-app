const user = require("../db/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// JWT token generator
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// Signup
const signup = catchAsync(async (req, res, next) => {
  const { userType, firstName, lastName, email, password, confirmPassword } = req.body;

  if (!["1", "2"].includes(userType)) {
    return next(new AppError("Invalid User Type", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const existingUser = await user.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError("Email already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await user.create({
    userType,
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  const result = newUser.toJSON();
  delete result.password;
  delete result.deletedAt;

  result.token = generateToken({ id: result.id });

  return res.status(201).json({ status: "success", data: result });
});

// Login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const existingUser = await user.findOne({ where: { email } });
  if (!existingUser) {
    return next(new AppError("Invalid email or password", 400));
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password", 400));
  }

  const result = existingUser.toJSON();
  delete result.password;
  delete result.deletedAt;

  result.token = generateToken({ id: result.id });

  return res.status(200).json({ status: "success", data: result });
});

module.exports = { signup, login };
