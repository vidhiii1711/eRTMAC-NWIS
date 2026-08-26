require('dotenv').config();
const mongoose = require('mongoose');
const Well = require('./models/Well');
const Event = require('./models/Event');
const wellsData = require('./data/well_master.json'); // your actual well file
const eventsData = require('./data/event_log.json');

// Convert raw JSON (Latitude/Longitude as strings) into schema-ready format
const formatWells = (rawWells) => {
  return rawWells.map((well) => ({
    wellId: well.Well_ID,
    wellName: well.Well_Name,
    field: well.Field,
    block: well.Block,
    location: {
      type: 'Point',
      coordinates: [
        parseFloat(well.Longitude), // longitude FIRST
        parseFloat(well.Latitude),  // latitude SECOND
      ],
    },
    wellType: well.Well_Type,
    spudDate: well.Spud_Date,
    completionDate: well.Completion_Date,
    totalDepth: parseFloat(well.Total_Depth),
    status: well.Status,
  }));
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Well.deleteMany({});
  await Event.deleteMany({});

  const formattedWells = formatWells(wellsData);
  await Well.insertMany(formattedWells);
  await Event.insertMany(eventsData);

  console.log(`Seed complete: ${formattedWells.length} wells inserted`);
  process.exit();
});