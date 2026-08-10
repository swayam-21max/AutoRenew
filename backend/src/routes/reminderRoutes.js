const express = require('express');
const reminderController = require('../controllers/reminderController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply JWT Auth
router.use(authenticate);

router.post('/trigger', reminderController.triggerEngine);
router.post('/test-email', reminderController.sendTestEmail);
router.get('/stats', reminderController.getStats);

module.exports = router;
