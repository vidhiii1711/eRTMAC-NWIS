const mongoose = require('mongoose');

const drillingDataSchema = new mongoose.Schema({
  Well_ID: String,
  Timestamp: String,
  Depth_MD: Number,
  Depth_TVD: Number,
  Formation: String,
  ROP: Number,
  WOB: Number,
  RPM: Number,
  Torque: Number,
  Standpipe_Pressure: Number,
  Flow_Rate: Number,
  Mud_Weight: Number,
  Plastic_Viscosity: Number,
  Yield_Point: Number,
  Hook_Load: Number,
  Inclination: Number,
  Bit_Type: String,
  Reservoir_Pressure: Number,
  Formation_Pore_Pressure: Number,
  Distance_To_Nearest_Offset_m: Number,
  Historical_Event_Count: Number,
  // These are the ACTUAL outcomes (ground truth) — only for reference/testing,
  // never sent to her ML API
  Mud_Loss_Label: Number,
  Stuck_Pipe_Label: Number,
  Kick_Label: Number,
});

module.exports = mongoose.model('DrillingData', drillingDataSchema);