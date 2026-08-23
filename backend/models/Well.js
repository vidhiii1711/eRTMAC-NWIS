const mongoose = require('mongoose');

const wellSchema = new mongoose.Schema({
  name: String,               // "OIL-001"
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]     // [longitude, latitude] — GeoJSON order
  },
  totalDepth: Number,
  formation: String,
  status: String               // e.g. "active", "completed"
});

wellSchema.index({ location: '2dsphere' }); // enables geospatial queries
module.exports = mongoose.model('Well', wellSchema);