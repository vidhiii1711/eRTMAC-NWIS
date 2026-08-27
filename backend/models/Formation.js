const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  formation: String,
  depthFrom: Number,
  depthTo: Number,
  lithology: String,
  rockType: String,
  porosityPct: Number,
  permeabilityMd: Number,
  reservoirPressurePsi: Number,
  temperatureC: Number,
});

module.exports = mongoose.model('Formation', formationSchema);