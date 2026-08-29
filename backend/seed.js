require('dotenv').config();
const mongoose = require('mongoose');
const Well = require('./models/Well');
const Event = require('./models/Event');
const wellsData = require('./data/well_master.json'); // your actual well file
const eventsData = require('./data/event_log.json');
const Formation = require('./models/Formation');
const formationsData = require('./data/formations.json');
const DrillingData = require('./models/DrillingData');
const drillingData = require('./data/drilling_timeseries_balanced.json');


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

// Convert raw formation JSON (strings) into schema-ready format
const formatFormations = (rawFormations) => {
  return rawFormations.map((f) => ({
    formation: f.formation,
    depthFrom: parseFloat(f.depth_from),
    depthTo: parseFloat(f.depth_to),
    lithology: f.lithology,
    rockType: f.rock_type,
    porosityPct: parseFloat(f.porosity_pct),
    permeabilityMd: parseFloat(f.permeability_md),
    reservoirPressurePsi: parseFloat(f.reservoir_pressure_psi),
    temperatureC: parseFloat(f.temperature_c),
  }));
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Well.deleteMany({});
  await Event.deleteMany({});
  await Formation.deleteMany({});
  await DrillingData.deleteMany({});

  const formattedWells = formatWells(wellsData);
  const formattedFormations = formatFormations(formationsData);
  await Well.insertMany(formattedWells);
  await Event.insertMany(eventsData);
  await Formation.insertMany(formattedFormations);
  await DrillingData.insertMany(drillingData);

  console.log(`Seed complete: ${formattedWells.length} wells inserted`);
  process.exit();
  console.log(`${drillingData.length} drilling records seeded`);
});