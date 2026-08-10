const { processReminders } = require('../schedulers/reminderScheduler');
const { sendTestEmail } = require('../services/emailService');
const reminderModel = require('../models/reminderModel');

const reminderController = {
  /**
   * POST /api/reminders/trigger
   * Admin tool: Immediately execute reminder engine logic without waiting for cron time.
   */
  async triggerEngine(req, res, next) {
    try {
      const result = await processReminders();

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: `⚡ Reminder Engine executed successfully! Checked ${result.totalChecked} vehicle(s), dispatched ${result.dispatched} email(s), skipped ${result.skipped} duplicate(s), ${result.failed} failed.`,
        summary: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/reminders/test-email
   * Admin tool: Send test email to ADMIN_EMAIL to verify SMTP configuration.
   */
  async sendTestEmail(req, res, next) {
    try {
      const targetEmail = req.body.email || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

      const result = await sendTestEmail(targetEmail);

      if (result.previewUrl) {
        return res.json({
          message: `✓ Test email generated via Sandbox! View Email Preview Link below.`,
          previewUrl: result.previewUrl,
          provider: result.provider,
        });
      }

      res.json({
        message: `✓ Test email successfully sent to ${targetEmail}`,
        provider: result.provider,
      });
    } catch (err) {
      res.status(500).json({
        error: `Test email failed: ${err.message}`,
      });
    }
  },

  /**
   * GET /api/reminders/stats
   * Fetch email reminder metrics for dashboard stats widgets.
   */
  async getStats(req, res, next) {
    try {
      const stats = await reminderModel.getReminderStats(req.user.id);
      res.json({ stats });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = reminderController;
