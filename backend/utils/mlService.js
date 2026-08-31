const axios = require('axios');

const ML_PREDICT_URL = process.env.ML_PREDICT_URL || 'http://localhost:8000/predict';
const ML_EXPLAIN_URL = process.env.ML_EXPLAIN_URL || 'http://localhost:8000/explain';
const ML_HISTORICAL_URL = process.env.ML_HISTORICAL_URL || 'http://localhost:8000/historical-intelligence';


// Removes MongoDB's internal fields + label fields before sending to her API
// (her API only expects the 20 raw fields she defined in DrillingData class)
const cleanPayload = (record) => {
  return {
    Well_ID: record.Well_ID,
    Timestamp: record.Timestamp,
    Depth_MD: record.Depth_MD,
    Depth_TVD: record.Depth_TVD,
    Formation: record.Formation,
    ROP: record.ROP,
    WOB: record.WOB,
    RPM: record.RPM,
    Torque: record.Torque,
    Standpipe_Pressure: record.Standpipe_Pressure,
    Flow_Rate: record.Flow_Rate,
    Mud_Weight: record.Mud_Weight,
    Plastic_Viscosity: record.Plastic_Viscosity,
    Yield_Point: record.Yield_Point,
    Hook_Load: record.Hook_Load,
    Inclination: record.Inclination,
    Bit_Type: record.Bit_Type,
    Reservoir_Pressure: record.Reservoir_Pressure,
    Formation_Pore_Pressure: record.Formation_Pore_Pressure,
    Distance_To_Nearest_Offset_m: record.Distance_To_Nearest_Offset_m,
    Historical_Event_Count: record.Historical_Event_Count,
  };
};

// const getRiskPrediction = async (record) => {
//   const payload = cleanPayload(record);
//   const response = await axios.post(ML_PREDICT_URL, payload);
//   return response.data;
// };

// const getRiskExplanation = async (record) => {
//   const payload = cleanPayload(record);
//   const response = await axios.post(ML_EXPLAIN_URL, payload);
//   return response.data;
// };

// const getHistoricalAnswer = async (question, wellIds) => {
//   const response = await axios.post(ML_HISTORICAL_URL, {
//     question,
//     well_ids: wellIds,
//   });
//   return response.data; // { question, well_ids, answer }
// };

const getRiskPrediction = async (record) => {
  const payload = cleanPayload(record);
  try {
    const response = await axios.post(ML_PREDICT_URL, payload);
    return response.data;
  } catch (error) {
    console.error('ML_PREDICT_URL value:', ML_PREDICT_URL);
    console.error('Predict API call failed:', error.message);
    throw error;
  }
};

const getHistoricalAnswer = async (question, wellIds) => {
  try {
    const response = await axios.post(ML_HISTORICAL_URL, {
      question,
      well_ids: wellIds,
    });
    return response.data;
  } catch (error) {
    console.error('ML_HISTORICAL_URL value:', ML_HISTORICAL_URL);
    console.error('Historical API call failed:', error.message);
    throw error; // still throw so the controller's catch block returns 500 properly
  }
};

module.exports = { getRiskPrediction, getRiskExplanation, getHistoricalAnswer};