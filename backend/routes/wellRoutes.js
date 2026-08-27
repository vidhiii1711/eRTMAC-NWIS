const express = require('express');
const router = express.Router();
const { getNearbyWells, getSimilarWells } = require('../controllers/wellController');
const protect = require('../middleware/authMiddleware');

router.get('/nearby', protect, getNearbyWells);
router.get('/similar/:wellId', protect, getSimilarWells);

module.exports = router;