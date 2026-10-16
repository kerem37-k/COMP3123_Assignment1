
const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  signupValidation,
  loginValidation,
  handleValidation
} = require("../controllers/authController");

router.post("/signup", signupValidation, handleValidation, signup);

router.post("/login", loginValidation, handleValidation, login);

module.exports = router;
