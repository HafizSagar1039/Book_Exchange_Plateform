// routes/auth.routes.js
import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import uploadProfile from "../middleware/upload.js";
import sendResetEmail from "../utils/sendResetEmail.js"; // Import the email utility
const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a user formData.append("firstName", data.firstName);
// @access  Public
router.post(
  "/register",
  uploadProfile.single("picture"),
  [
    body("firstName").notEmpty().withMessage("firstName is required"),
    body("lastName").notEmpty().withMessage("lastName is required"),
    body("username").notEmpty().withMessage("userName is required"),
    body("mobile").notEmpty().withMessage("mobile No is required"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("address").notEmpty().withMessage("address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, username, mobile, email, password, address } =
      req.body;
    const profilePic = req.file ? req.file.filename : null;

    try {
      const [existingUsers] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("i am running befor running the query");
      const [result] = await db.query(
        "INSERT INTO users (first_name , last_name , username , password , mobile , address , email ,picture) VALUES (?, ?, ?, ?,?,?,?,?)",
        [
          firstName,
          lastName,
          username,
          hashedPassword,
          mobile,
          address,
          email,
          profilePic,
        ]
      );

      // const token = jwt.sign(
      //   { userId: result.insertId },
      //   process.env.JWT_SECRET,
      //   { expiresIn: process.env.JWT_EXPIRE }
      // );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        // token,
        user: {
          id: result.insertId,
          firstName,
          lastName,
          username,
          mobile,
          address,
          profilePic,
          email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const user = users[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          profilePic: user.picture,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please include a valid email")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const resetToken = jwt.sign(
        { userId: users[0].id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const result = await sendResetEmail(email, resetToken);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to send email",
        });
      }

      res.json({
        success: true,
        message: "Password reset token sent to your email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);
// @route   POST api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
  console.log('Reset password endpoint hit');
    const { token, password } = req.body;

    try {

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password reset token has expired' 
        });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user's password
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, decoded.userId]
      );

      res.json({ 
        success: true, 
        message: 'Password has been reset successfully' 
      });

    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error during password reset' 
      });
    }
  }
);


export default router;
