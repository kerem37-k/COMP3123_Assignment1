
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const signupValidation = [
  body("username").trim().isLength({ min: 3, max: 50 }),
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isLength({ min: 8, max: 128 })
];

const loginValidation = [
  body("password").notEmpty(),
  body().custom((value) => {
    if (!value.username && !value.email) {
      throw new Error("Username or email is required");
    }
    return true;
  })
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array()
    });
  }
  next();
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existing) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne(
      email ? { email: email.toLowerCase() } : { username }
    ).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  signupValidation,
  loginValidation,
  handleValidation
};
