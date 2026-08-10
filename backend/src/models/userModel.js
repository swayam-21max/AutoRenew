const { query } = require('../config/db');

const userModel = {
  async createUser(fullName, email, passwordHash, phoneNumber = null, notificationPreference = 'EMAIL') {
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, phone_number, notification_preference)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone_number, notification_preference, created_at`,
      [fullName, email, passwordHash, phoneNumber, notificationPreference]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query(
      'SELECT id, full_name, email, password_hash, phone_number, notification_preference, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, full_name, email, phone_number, notification_preference, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async updateProfile(id, { fullName, phoneNumber, notificationPreference }) {
    const result = await query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone_number = $2,
           notification_preference = COALESCE($3, notification_preference)
       WHERE id = $4
       RETURNING id, full_name, email, phone_number, notification_preference, created_at`,
      [fullName, phoneNumber || null, notificationPreference, id]
    );
    return result.rows[0] || null;
  },
};

module.exports = userModel;
