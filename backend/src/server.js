const app = require('./app');
const { initDatabase } = require('./config/db');
const { initScheduler } = require('./schedulers/reminderScheduler');

const PORT = process.env.PORT || 5000;

// Auto-initialize database schema on startup
initDatabase().catch((err) => {
  console.warn('⚠ Database connection warning:', err.message);
});

// If running locally (not Vercel serverless function), start Express server listener & scheduler
if (process.env.VERCEL !== '1') {
  try {
    initScheduler();
    console.log('✓ Reminder scheduler initialized');
  } catch (err) {
    console.warn('⚠ Reminder scheduler warning:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`✓ PolicyPulse API running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export Express app for Vercel serverless functions
module.exports = app;
