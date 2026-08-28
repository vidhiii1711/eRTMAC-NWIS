const express = require('express');
const router = express.Router();
const {
  getNearbyWells,
  getSimilarWells,
  createWell,
  searchWells,
  getWellByWellId,
} = require('../controllers/wellController');
const protect = require('../middleware/authMiddleware');

// Specific/fixed routes FIRST
router.post('/', protect, createWell);
router.get('/nearby', protect, getNearbyWells);
router.get('/search', protect, searchWells);
router.get('/similar/:wellId', protect, getSimilarWells);

// Generic catch-all route LAST
router.get('/:wellId', protect, getWellByWellId);

module.exports = router;