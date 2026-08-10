const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { validateRegistration, validateLogin } = require('../utils/validators');

const SALT_ROUNDS = 12;

const generateToken = (user) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'swayamkataria.dev@gmail.com';
  const isTargetAdmin = user.email && user.email.toLowerCase() === adminEmail.toLowerCase();
  const role = user.role || (isTargetAdmin ? 'ADMIN' : 'USER');
  return jwt.sign(
    { id: user.id, email: user.email, role },
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
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await userModel.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const adminEmail = process.env.ADMIN_EMAIL || 'swayamkataria.dev@gmail.com';
      const role = normalizedEmail === adminEmail.toLowerCase() ? 'ADMIN' : 'USER';

      // Create user
      const user = await userModel.createUser(
        fullName.trim(),
        normalizedEmail,
        passwordHash,
        phoneNumber?.trim() || null,
        notificationPreference || 'EMAIL',
        role
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
          role: user.role || role,
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
      const normalizedEmail = email.trim().toLowerCase();
      const user = await userModel.findByEmail(normalizedEmail);
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
          role: user.role || 'USER',
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
          role: user.role || 'USER',
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
