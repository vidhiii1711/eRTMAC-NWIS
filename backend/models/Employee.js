const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // stored as hash, never plain text
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);