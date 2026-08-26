const express = require('express');
const router = express.Router();
const { getNearbyWells } = require('../controllers/wellController');
const protect = require('../middleware/authMiddleware');

router.get('/nearby', protect, getNearbyWells);

module.exports = router;