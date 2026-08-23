require('dotenv').config();
const mongoose = require('mongoose');
const Well = require('./models/Well');
const Event = require('./models/Event');
const wellsData = require('./data/wells.json');   // whoever writes Step 2 data drops it here
const eventsData = require('./data/events.json');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Well.deleteMany({});
  await Event.deleteMany({});
  const insertedWells = await Well.insertMany(wellsData);
  await Event.insertMany(eventsData);
  console.log('Seed complete');
  process.exit();
});