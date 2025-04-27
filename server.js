require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const mqtt = require('mqtt');
const { Server } = require('socket.io');
const path = require('path'); // เพิ่มเข้ามา
const SensorData = require('./db');

const app = express();
app.use(cors());

// Serve frontend static files
app.use(express.static(__dirname));

// สร้าง server สำหรับ socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// ตรวจสอบ ENV
const MONGO_URI = process.env.MONGO_URI;
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'sensor/data';
const PORT = process.env.PORT || 5084;

// เชื่อม MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// เชื่อม MQTT
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log(`✅ MQTT connected to ${MQTT_BROKER}`);
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (!err) console.log(`📡 Subscribed to topic: ${MQTT_TOPIC}`);
    else console.error('❌ MQTT subscribe error:', err);
  });
});

// รับ message จาก MQTT แล้วบันทึกลง MongoDB + ส่งต่อไป WebSocket
mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    console.log('📦 ได้รับข้อมูลจาก MQTT:', data);

    const newData = new SensorData(data);
    await newData.save();

    console.log('💾 บันทึกข้อมูลลง MongoDB สำเร็จ');

    io.emit('newSensorData', newData);
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดตอนจัดการข้อความ MQTT:', err.message);
  }
});

// WebSocket communication
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

// Route: เสิร์ฟ index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: ดึงข้อมูลล่าสุด
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

// Route: ดึงข้อมูลทั้งหมด
app.get('/api/sensors', async (req, res) => {
  try {
    const allData = await SensorData.find().sort({ timestamp: -1 });
    res.json(allData);
  } catch (err) {
    console.error('❌ Error in /api/sensors API:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
