const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin } = require('../utils/validators');

const SALT_ROUNDS = 12;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { fullName, email, password, confirmPassword, phoneNumber, notificationPreference } = req.body;

      // Validate input
      const errors = validateRegistration({ fullName, email, password, confirmPassword });
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Check if user already exists
      const existingUser = await userModel.findByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const user = await userModel.createUser(
        fullName.trim(),
        email.toLowerCase(),
        passwordHash,
        phoneNumber?.trim() || null,
        notificationPreference || 'EMAIL'
      );

      // Generate JWT
      const token = generateToken(user);

      res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
          notificationPreference: user.notification_preference,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input
      const errors = validateLogin({ email, password });
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Find user
      const user = await userModel.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Generate JWT
      const token = generateToken(user);

      res.json({
        message: 'Logged in successfully.',
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
          notificationPreference: user.notification_preference,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
          notificationPreference: user.notification_preference,
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
