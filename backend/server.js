require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Well = require('./models/Well');
const Event = require('./models/Event');
const authRoutes = require('./routes/authRoutes');
const wellRoutes = require('./routes/wellRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log('Body received:', req.body);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/wells', wellRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await Well.createIndexes();
    console.log('Indexes ensured');
  })
  .catch(err => console.error(err));

app.get('/wells', async (req, res) => {
  try {
    const wells = await Well.find();
    res.json(wells);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/wells/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'lat, lng, and radius are required' });
    }
    const wells = await Well.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    });
    res.json(wells);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/wells/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid well ID format' });
    }
    const well = await Well.findById(req.params.id);
    if (!well) return res.status(404).json({ error: 'Well not found' });
    res.json(well);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/events/:wellId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.wellId)) {
      return res.status(400).json({ error: 'Invalid wellId format' });
    }
    const events = await Event.find({ wellId: req.params.wellId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/ai/query', async (req, res) => {
  try {
    res.json({ answer: 'stub response — AI service not wired yet' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/predict-risk', async (req, res) => {
  try {
    res.json({ risk: 50, label: 'stub — ML service not wired yet' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));