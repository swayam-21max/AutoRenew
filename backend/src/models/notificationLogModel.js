const { query } = require('../config/db');

const notificationLogModel = {
  /**
   * Get notification statistics for dashboard widget.
   */
  async getStats(userId = null) {
    const userClause = userId ? 'JOIN vehicles v ON rl.vehicle_id = v.id WHERE v.user_id = $1' : '';
    const params = userId ? [userId] : [];

    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE rl.notification_channel = 'EMAIL' OR rl.notification_channel IS NULL) AS emails_sent,
         COUNT(*) FILTER (WHERE rl.notification_channel = 'SMS') AS sms_sent,
         COUNT(*) FILTER (WHERE rl.notification_channel = 'WHATSAPP') AS whatsapp_sent,
         COUNT(*) FILTER (WHERE rl.status = 'FAILED') AS failed_deliveries,
         COUNT(*) FILTER (WHERE rl.status IN ('SUCCESS', 'SENT', 'SIMULATED')) AS successful_deliveries,
         MAX(rl.sent_at) AS last_notification_sent
       FROM reminder_logs rl
       ${userClause}`,
      params
    );

    const row = result.rows[0] || {};
    const totalSent = parseInt(row.emails_sent || 0, 10) + parseInt(row.sms_sent || 0, 10) + parseInt(row.whatsapp_sent || 0, 10);
    const successful = parseInt(row.successful_deliveries || 0, 10);
    const successRate = totalSent > 0 ? Math.round((successful / totalSent) * 100) : 100;

    return {
      emailsSent: parseInt(row.emails_sent || 0, 10),
      smsSent: parseInt(row.sms_sent || 0, 10),
      whatsappSent: parseInt(row.whatsapp_sent || 0, 10),
      failedDeliveries: parseInt(row.failed_deliveries || 0, 10),
      totalNotifications: totalSent,
      successRate,
      lastNotificationSent: row.last_notification_sent || null,
    };
  },
};

module.exports = notificationLogModel;

