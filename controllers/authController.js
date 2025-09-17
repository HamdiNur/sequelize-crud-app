const user = require("../db/models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");

// JWT generator
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// Signup
const signup = catchAsync(async (req, res, next) => {
  const { userType, firstName, lastName, email, password, confirmPassword } = req.body;

  if (!["1","2"].includes(userType)) {
    return next(new AppError("Invalid User Type", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError("Password must be at least 6 characters long", 400));
  }

  const existingUser = await user.findOne({
    where: { email },
    paranoid: false
  });

  if (existingUser) {
    return next(new AppError("Email already exists", 400));
  }

  // Pass plain password; hook hashes it
  const newUser = await user.create({
    userType,
    firstName,
    lastName,
    email,
    password
  });

  const result = newUser.toJSON();
  delete result.password;
  delete result.deletedAt;

  result.token = generateToken({ id: result.id });

  res.status(201).json({ status: "success", data: result });
});

// Login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const existingUser = await user.findOne({
    where: { email },
    attributes: { include: ["password"] },
    paranoid: false
  });

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

  res.status(200).json({ status: "success", data: result });
});

// Authentication middleware
const authentication = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in!", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await user.findByPk(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  req.user = currentUser;
  next();
});




const restrictTo = (...allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.user.userType)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };
};


module.exports = { signup, login, authentication ,restrictTo};
