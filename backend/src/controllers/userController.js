const userModel = require('../models/userModel');

const ALLOWED_PREFERENCES = ['EMAIL', 'SMS', 'WHATSAPP', 'EMAIL_SMS', 'EMAIL_WHATSAPP', 'ALL'];

const userController = {
  /**
   * GET /api/profile
   */
  async getProfile(req, res, next) {
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
          notificationPreference: user.notification_preference || 'EMAIL',
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/profile
   */
  async updateProfile(req, res, next) {
    try {
      const { fullName, phoneNumber, notificationPreference } = req.body;

      // Validate Notification Preference
      if (notificationPreference && !ALLOWED_PREFERENCES.includes(notificationPreference.toUpperCase())) {
        return res.status(400).json({
          error: `Invalid notification preference. Must be one of: ${ALLOWED_PREFERENCES.join(', ')}`,
        });
      }

      // Validate Phone Number format if provided
      if (phoneNumber && phoneNumber.trim() !== '') {
        const cleanPhone = phoneNumber.trim();
        const phoneRegex = /^\+?[1-9]\d{6,14}$/;
        if (!phoneRegex.test(cleanPhone)) {
          return res.status(400).json({
            error: 'Invalid phone number format. Please provide international format, e.g., +919876543210',
          });
        }
      }

      const updated = await userModel.updateProfile(req.user.id, {
        fullName: fullName?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        notificationPreference: notificationPreference ? notificationPreference.toUpperCase() : null,
      });

      res.json({
        message: 'Profile settings updated successfully.',
        user: {
          id: updated.id,
          fullName: updated.full_name,
          email: updated.email,
          phoneNumber: updated.phone_number,
          notificationPreference: updated.notification_preference,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;
