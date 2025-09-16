const user = require("../db/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// JWT token generator
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// Signup
const signup = async (req, res) => {
  try {
    const { userType, firstName, lastName, email, password, confirmPassword } = req.body;

    if (!["1", "2"].includes(userType)) {
      return res.status(400).json({ status: "fail", message: "Invalid user type" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ status: "fail", message: "Passwords do not match" });
    }

    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: "fail", message: "Email already exists" });
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await user.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({ status: "fail", message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ status: "fail", message: "Invalid email or password" });
    }

    const result = existingUser.toJSON();
    delete result.password;
    delete result.deletedAt;

    // Generate JWT
    result.token = generateToken({ id: result.id });

    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

module.exports = { signup, login };
