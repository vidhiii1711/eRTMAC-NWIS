const express = require('express');
const router = express.Router();
const { getEarlyWarning } = require('../controllers/earlyWarningController');
const protect = require('../middleware/authMiddleware');

router.get('/:wellId', protect, getEarlyWarning);

module.exports = router;