const Well = require('../models/Well');

// @route GET /api/wells/nearby?lat=26.11&lng=82.66&radius=20
exports.getNearbyWells = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({
        message: 'lat, lng and radius are required (radius in km)',
      });
    }

    const radiusInMeters = parseFloat(radius) * 1000; // convert km to meters

    const nearbyWells = await Well.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    });

    res.status(200).json({
      count: nearbyWells.length,
      wells: nearbyWells,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};