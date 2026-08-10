const express = require('express');
const { pool } = require('../config/db');
const { sendReminderEmail } = require('../services/notifications/emailService');
const { sendReminderSms } = require('../services/notifications/smsService');
const { sendReminderWhatsApp } = require('../services/notifications/whatsappService');
const { processReminders } = require('../schedulers/reminderScheduler');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: result.rows[0].now,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

/**
 * POST /api/health/trigger-scheduler
 * Manually trigger the vehicle compliance reminder sweep across active user preference channels.
 */
router.post('/trigger-scheduler', async (req, res, next) => {
  try {
    await processReminders();
    res.json({
      message: '✓ Manual vehicle compliance reminder check sweep executed across Email, SMS, and WhatsApp channels.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/health/test-email
 */
router.post('/test-email', async (req, res, next) => {
  try {
    const targetEmail = req.body.email || process.env.EMAIL_USER || 'test@policypulse.com';

    const result = await sendReminderEmail({
      to: targetEmail,
      userName: req.body.userName || 'Vehicle Owner',
      policyNumber: 'PB01AB0001 — Vehicle Insurance Renewal',
      insuranceCompany: 'Vehicle Compliance Platform',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 7,
    });

    if (result.previewUrl) {
      return res.json({
        message: `✓ Test reminder email generated via Ethereal Sandbox! Click preview link below.`,
        previewUrl: result.previewUrl,
        provider: result.provider,
      });
    }

    res.json({
      message: `✓ Real test reminder email successfully sent to ${targetEmail}`,
      provider: result.provider,
    });
  } catch (err) {
    res.status(500).json({
      error: `Email sending failed: ${err.message}`,
    });
  }
});

/**
 * POST /api/health/test-sms
 */
router.post('/test-sms', async (req, res, next) => {
  try {
    const phoneNumber = req.body.phoneNumber || '+919876543210';

    const result = await sendReminderSms({
      phoneNumber,
      userName: req.body.userName || 'Vehicle Owner',
      policyNumber: 'PB01AB0001',
      insuranceCompany: 'Insurance Renewal',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 7,
    });

    res.json({
      message: result.simulated
        ? `✓ Test SMS simulated in Sandbox Mode for ${phoneNumber}`
        : `✓ SMS successfully dispatched to ${phoneNumber}`,
      provider: result.provider,
      result,
    });
  } catch (err) {
    res.status(500).json({ error: `SMS delivery failed: ${err.message}` });
  }
});

/**
 * POST /api/health/test-whatsapp
 */
router.post('/test-whatsapp', async (req, res, next) => {
  try {
    const phoneNumber = req.body.phoneNumber || '+919876543210';

    const result = await sendReminderWhatsApp({
      phoneNumber,
      userName: req.body.userName || 'Vehicle Owner',
      policyNumber: 'PB01AB0001',
      insuranceCompany: 'Insurance Renewal',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 7,
    });

    res.json({
      message: result.simulated
        ? `✓ Test WhatsApp message simulated in Sandbox Mode for whatsapp:${phoneNumber}`
        : `✓ WhatsApp message successfully dispatched to ${phoneNumber}`,
      provider: result.provider,
      result,
    });
  } catch (err) {
    res.status(500).json({ error: `WhatsApp delivery failed: ${err.message}` });
  }
});

module.exports = router;
