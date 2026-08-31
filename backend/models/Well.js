const mongoose = require('mongoose');

const wellSchema = new mongoose.Schema(
  {
    wellId: { type: String, required: true, unique: true },       // "W001"
    wellName: String,                                              // "Alpha-01"
    field: String,                                                 // "Field_Alpha"
    block: String,                                                 // "Block_1"
    latitude: Number,
    longitude: Number,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number], // [longitude, latitude] — GeoJSON order, REQUIRED for geo queries
    },
    wellType: String,        // Exploratory / Development / Appraisal
    spudDate: String,
    completionDate: String,
    totalDepth: Number,
    status: String,          // Completed / Drilling
    formation: String,
  },
  { timestamps: true }
);

wellSchema.index({ location: '2dsphere' }); // enables radius/geo queries

module.exports = mongoose.model('Well', wellSchema);