const DrillingData = require('../models/DrillingData');
const { getRiskPrediction, getRiskExplanation } = require('../utils/mlService');

// @route GET /api/risk/:wellId
// Gets the LATEST drilling reading for a well, and asks her API to predict risk
exports.predictRiskForWell = async (req, res) => {
  try {
    const { wellId } = req.params;

    // Get the most recent reading for this well (sorted by Timestamp, descending)
    const latestRecord = await DrillingData.findOne({ Well_ID: wellId }).sort({
      Timestamp: -1,
    });

    if (!latestRecord) {
      return res.status(404).json({ message: 'No drilling data found for this well' });
    }

    const prediction = await getRiskPrediction(latestRecord);

    res.status(200).json({
      wellId,
      timestamp: latestRecord.Timestamp,
      depth: latestRecord.Depth_MD,
      prediction,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error getting prediction',
      error: error.message,
    });
  }
};

// @route GET /api/risk/:wellId/explain
exports.explainRiskForWell = async (req, res) => {
  try {
    const { wellId } = req.params;

    const latestRecord = await DrillingData.findOne({ Well_ID: wellId }).sort({
      Timestamp: -1,
    });

    if (!latestRecord) {
      return res.status(404).json({ message: 'No drilling data found for this well' });
    }

    const explanation = await getRiskExplanation(latestRecord);

    res.status(200).json({
      wellId,
      timestamp: latestRecord.Timestamp,
      depth: latestRecord.Depth_MD,
      explanation,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error getting explanation',
      error: error.message,
    });
  }
};