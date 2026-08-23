const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  wellId: { type: mongoose.Schema.Types.ObjectId, ref: 'Well' },
  title: String,           // e.g. "Daily Drilling Report - OIL-004"
  rawText: String,          // the full synthetic report paragraph(s)
  extracted: {
    depth: Number,
    event: String,          // "mud loss", "stuck pipe", etc.
    cause: String,
    mitigation: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);