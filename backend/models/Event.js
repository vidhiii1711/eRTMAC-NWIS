const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  wellId: { type: mongoose.Schema.Types.ObjectId, ref: 'Well' },
  depth: Number,
  type: String,       // "mud loss", "stuck pipe", "kick", etc.
  description: String,
  mitigation: String,
  date: Date
});

module.exports = mongoose.model('Event', eventSchema);