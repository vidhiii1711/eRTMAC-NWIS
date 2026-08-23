const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  name: String,          // "Formation-B"
  minDepth: Number,       // e.g. 2700 (meters)
  maxDepth: Number,       // e.g. 3100
  rockType: String,       // optional, e.g. "sandstone" — nice detail for demo credibility
  region: String           // optional, e.g. "Assam basin" — keep flexible
});

module.exports = mongoose.model('Formation', formationSchema);