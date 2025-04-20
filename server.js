require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const SensorData = require('./models/SensorData');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// WebSocket communication
io.on('connection', (socket) => {
  console.log('New client connected');

  // รับข้อมูลจาก client
  socket.on('sendSensorData', async (data) => {
    const newData = new SensorData(data);
    await newData.save();

    // ส่งข้อมูลไปยัง client ทุกคน
    io.emit('newSensorData', newData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API ดึงข้อมูลล่าสุด
app.get('/latest', async (req, res) => {
  const latest = await SensorData.find().sort({ timestamp: -1 }).limit(1);
  res.json(latest[0]);
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
