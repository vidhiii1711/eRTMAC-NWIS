const Well = require('../models/Well');
const getFormationByDepth = require('../utils/formationHelper');

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

// @route GET /api/wells/similar/:wellId
exports.getSimilarWells = async (req, res) => {
  try {
    const { wellId } = req.params;
    const { limit } = req.query;

    const targetWell = await Well.findOne({ wellId });

    if (!targetWell) {
      return res.status(404).json({ message: 'Well not found' });
    }

    // NEW: find target well's formation based on its depth
    const targetFormation = await getFormationByDepth(targetWell.totalDepth);

    const otherWells = await Well.find({ wellId: { $ne: wellId } });

    // NEW: we use Promise.all because we now do an async lookup (formation) for each well
    const scoredWells = await Promise.all(
      otherWells.map(async (well) => {
        let score = 0;

        // 1. Depth closeness (max 30 points) — reduced from 40 to make room for formation
        const depthDiff = Math.abs(well.totalDepth - targetWell.totalDepth);
        if (depthDiff <= 50) score += 30;
        else if (depthDiff <= 150) score += 20;
        else if (depthDiff <= 300) score += 10;

        // 2. Same well type (25 points)
        if (well.wellType === targetWell.wellType) score += 25;

        // 3. Same field (15 points)
        if (well.field === targetWell.field) score += 15;

        // 4. Same block (10 points)
        if (well.block === targetWell.block) score += 10;

        // 5. NEW: Same formation (20 points) — strong indicator of similar drilling conditions
        const wellFormation = await getFormationByDepth(well.totalDepth);
        let formationName = wellFormation ? wellFormation.formation : null;

        if (
          targetFormation &&
          wellFormation &&
          targetFormation.formation === wellFormation.formation
        ) {
          score += 20;
        }

        return {
          wellId: well.wellId,
          wellName: well.wellName,
          field: well.field,
          block: well.block,
          wellType: well.wellType,
          totalDepth: well.totalDepth,
          formation: formationName, // NEW: show which formation this well is in
          status: well.status,
          similarityScore: score,
        };
      })
    );

    scoredWells.sort((a, b) => b.similarityScore - a.similarityScore);

    const topResults = scoredWells.slice(0, parseInt(limit) || 5);

    res.status(200).json({
      targetWell: {
        wellId: targetWell.wellId,
        wellName: targetWell.wellName,
        totalDepth: targetWell.totalDepth,
        wellType: targetWell.wellType,
        field: targetWell.field,
        block: targetWell.block,
        formation: targetFormation ? targetFormation.formation : null, // NEW
      },
      count: topResults.length,
      similarWells: topResults,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};