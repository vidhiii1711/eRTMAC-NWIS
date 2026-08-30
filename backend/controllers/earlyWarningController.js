const axios = require('axios');
const Well = require('../models/Well');
const DrillingData = require('../models/DrillingData');

const EARLY_WARNING_URL = process.env.ML_EARLY_WARNING_URL || 'http://localhost:8000/early-warning';

// Reuses the same "clean payload" idea from mlService.js
const cleanDrillingData = (record) => ({
  Well_ID: record.Well_ID,
  Timestamp: record.Timestamp,
  Depth_MD: record.Depth_MD,
  Depth_TVD: record.Depth_TVD,
  Formation: record.Formation,
  ROP: record.ROP,
  WOB: record.WOB,
  RPM: record.RPM,
  Torque: record.Torque,
  Standpipe_Pressure: record.Standpipe_Pressure,
  Flow_Rate: record.Flow_Rate,
  Mud_Weight: record.Mud_Weight,
  Plastic_Viscosity: record.Plastic_Viscosity,
  Yield_Point: record.Yield_Point,
  Hook_Load: record.Hook_Load,
  Inclination: record.Inclination,
  Bit_Type: record.Bit_Type,
  Reservoir_Pressure: record.Reservoir_Pressure,
  Formation_Pore_Pressure: record.Formation_Pore_Pressure,
  Distance_To_Nearest_Offset_m: record.Distance_To_Nearest_Offset_m,
  Historical_Event_Count: record.Historical_Event_Count,
});

// @route GET /api/early-warning/:wellId?radius=20&lookahead=100
exports.getEarlyWarning = async (req, res) => {
  try {
    const { wellId } = req.params;
    const radiusKm = parseFloat(req.query.radius) || 20;
    const lookahead = parseFloat(req.query.lookahead) || 100;

    // Step 1: Get the target well (for its location)
    const targetWell = await Well.findOne({ wellId });
    if (!targetWell) {
      return res.status(404).json({ message: 'Well not found' });
    }

    // Step 2: Find nearby wells using existing geospatial query
    const [lng, lat] = targetWell.location.coordinates;
    const radiusInMeters = radiusKm * 1000;

    const nearbyWells = await Well.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusInMeters,
        },
      },
    });

    const nearbyWellIds = nearbyWells.map((w) => w.wellId);

    // Step 3: Get the latest drilling data reading for the target well
    const latestRecord = await DrillingData.findOne({ Well_ID: wellId }).sort({
      Timestamp: -1,
    });

    if (!latestRecord) {
      return res.status(404).json({ message: 'No drilling data found for this well' });
    }

    // Step 4: Call her early-warning endpoint with everything bundled together
    const payload = {
      drilling_data: cleanDrillingData(latestRecord),
      nearby_well_ids: nearbyWellIds,
      lookahead,
    };

    const response = await axios.post(EARLY_WARNING_URL, payload);

    res.status(200).json({
      wellId,
      depth: latestRecord.Depth_MD,
      nearbyWellsChecked: nearbyWellIds,
      ...response.data, // { level, warnings, historical_events }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error generating early warning',
      error: error.response?.data || error.message,
    });
  }
};