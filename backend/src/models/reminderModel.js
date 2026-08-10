const { query } = require('../config/db');

const reminderModel = {
  /**
   * Check if a specific reminder threshold has already been successfully sent for a vehicle.
   */
  async hasBeenSent(vehicleId, reminderType, daysBefore) {
    const result = await query(
      `SELECT id FROM reminder_logs
       WHERE vehicle_id = $1 AND reminder_type = $2 AND days_before = $3 AND status = 'SUCCESS'`,
      [vehicleId, reminderType, daysBefore]
    );
    return result.rows.length > 0;
  },

  /**
   * Log a sent or attempted email reminder.
   */
  async logReminder(vehicleId, reminderType, daysBefore, recipientEmail, status = 'SUCCESS', errorMessage = null) {
    await query(
      `INSERT INTO reminder_logs (vehicle_id, reminder_type, days_before, recipient_email, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (vehicle_id, reminder_type, days_before)
       DO UPDATE SET status = $5, recipient_email = $4, error_message = $6, sent_at = NOW()`,
      [vehicleId, reminderType, daysBefore, recipientEmail, status, errorMessage]
    );
  },

  /**
   * Get reminder email statistics for the admin dashboard.
   */
  async getReminderStats(userId = null) {
    const userClause = userId ? 'JOIN vehicles v ON rl.vehicle_id = v.id WHERE v.user_id = $1' : '';
    const params = userId ? [userId] : [];

    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE rl.status = 'SUCCESS') AS total_emails_sent,
         COUNT(*) FILTER (WHERE rl.status = 'SUCCESS' AND rl.sent_at >= CURRENT_DATE) AS emails_sent_today,
         COUNT(*) FILTER (WHERE rl.status = 'FAILED') AS failed_emails,
         MAX(rl.sent_at) FILTER (WHERE rl.status = 'SUCCESS') AS last_reminder_sent
       FROM reminder_logs rl
       ${userClause}`,
      params
    );

    const row = result.rows[0] || {};
    return {
      totalEmailsSent: parseInt(row.total_emails_sent || 0, 10),
      emailsSentToday: parseInt(row.emails_sent_today || 0, 10),
      failedEmails: parseInt(row.failed_emails || 0, 10),
      lastReminderSent: row.last_reminder_sent || null,
    };
  },
};

module.exports = reminderModel;
