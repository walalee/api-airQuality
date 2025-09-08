require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const SensorData = require('./db');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5084;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected (Server)'))
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

io.on('connection', (socket) => {
  console.log('🟢 WebSocket client connected');

  socket.on('sendSensorData', async (data) => {
    try {
      const newData = new SensorData(data);
      await newData.save();
      io.emit('newSensorData', newData);
    } catch (err) {
      console.error('❌ Error saving sensor data:', err);
      socket.emit('errorSavingData', { message: 'Invalid data format or DB error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 WebSocket client disconnected');
  });
});

app.get('/latest', async (req, res) => {
  try {
    const latest = await SensorData.find().sort({ timestamp: -1 }).limit(1);
    if (latest.length === 0) {
      return res.status(404).json({ message: 'No sensor data found' });
    }
    res.json(latest[0]);
  } catch (err) {
    console.error('❌ Error in /latest API:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
