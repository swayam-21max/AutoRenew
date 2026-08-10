const { query } = require('../config/db');

const userModel = {
  async createUser(fullName, email, passwordHash, phoneNumber = null, notificationPreference = 'EMAIL', role = 'USER') {
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, phone_number, notification_preference, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, phone_number, notification_preference, role, created_at`,
      [fullName, email, passwordHash, phoneNumber, notificationPreference, role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query(
      'SELECT id, full_name, email, password_hash, phone_number, notification_preference, role, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, full_name, email, phone_number, notification_preference, role, created_at FROM users WHERE id = $1',
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
       RETURNING id, full_name, email, phone_number, notification_preference, role, created_at`,
      [fullName, phoneNumber || null, notificationPreference, id]
    );
    return result.rows[0] || null;
  },
};

module.exports = userModel;
