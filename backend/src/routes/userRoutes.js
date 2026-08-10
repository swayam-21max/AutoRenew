const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply JWT authentication to profile routes
router.use(authenticate);

router.get('/', userController.getProfile);
router.put('/', userController.updateProfile);

module.exports = router;
