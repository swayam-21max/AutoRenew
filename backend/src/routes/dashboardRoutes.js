const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stats', authenticate, dashboardController.getStats);

module.exports = router;
