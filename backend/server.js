const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://bechahana:BME2023@poseestimation.ede2ffl.mongodb.net/';
mongoose.connect(mongoURI, {
  useNewUrlParser: true, // useNewUrlParser is no longer needed, but it's harmless to keep it
  useUnifiedTopology: true, // useUnifiedTopology is no longer needed, but it's harmless to keep it
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of the default 30 seconds
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

// Define CoordinateModel directly in server.js
const coordinateSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CoordinateModel = mongoose.model('Coordinate', coordinateSchema);

// Routes
app.post('/api/save-coordinates', async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!Array.isArray(coordinates)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates format.' });
    }

    const savedCoordinates = await Promise.all(
      coordinates.map(async (coord) => {
        const { x, y } = coord;
        const newCoordinate = new CoordinateModel({ x, y });
        await newCoordinate.save();
        return newCoordinate;
      })
    );

    res.status(200).json({ success: true, message: 'Coordinates saved successfully.', coordinates: savedCoordinates });
  } catch (error) {
    console.error('Error saving coordinates:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.get('/api/get-coordinates', async (req, res) => {
  try {
    const coordinates = await CoordinateModel.find();
    console.log('Fetched coordinates:', coordinates);
    res.status(200).json({ success: true, coordinates });
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
