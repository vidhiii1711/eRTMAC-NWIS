const express = require('express');
const router = express.Router();
const { predictRiskForWell, explainRiskForWell,searchHistoricalDocuments } = require('../controllers/riskController');
const protect = require('../middleware/authMiddleware');

router.get('/:wellId', protect, predictRiskForWell);
router.get('/:wellId/explain', protect, explainRiskForWell);
router.post('/historical-search', protect, searchHistoricalDocuments);

module.exports = router;