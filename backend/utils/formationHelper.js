const Formation = require('../models/Formation');

// Given a depth (number), find which formation it falls into
const getFormationByDepth = async (depth) => {
  const formation = await Formation.findOne({
    depthFrom: { $lte: depth }, // depth is greater than or equal to depthFrom
    depthTo: { $gte: depth },   // depth is less than or equal to depthTo
  });

  return formation; // returns null if no match found
};

module.exports = getFormationByDepth;