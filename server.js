require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const mqtt = require('mqtt');
const { Server } = require('socket.io');
const path = require('path');
const SensorData = require('./db');

const app = express();
app.use(cors());
app.use(express.static(__dirname));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const MONGO_URI = process.env.MONGO_URI;
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'sensor/data';
const PORT = process.env.PORT || 5084;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log(`✅ MQTT connected to ${MQTT_BROKER}`);
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (!err) console.log(`📡 Subscribed to topic: ${MQTT_TOPIC}`);
    else console.error('❌ MQTT subscribe error:', err);
  });
});

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

// ---- เพิ่มจำลองข้อมูล weather AI ----
function generateWeatherForecast() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const statusOptions = ['clear', 'cloudy', 'rainy', 'stormy', 'foggy'];

  return {
    temperature: Math.floor(Math.random() * 10) + 28, // 28-37°C
    humidity: Math.floor(Math.random() * 40) + 40,     // 40-80%
    windSpeed: Math.floor(Math.random() * 10) + 5,     // 5-15 km/h
    forecast: Array.from({ length: 7 }, (_, i) => ({
      day: days[(new Date().getDay() + i) % 7],
      temp: Math.floor(Math.random() * 10) + 28,
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      highlights: {
        "PM2.5": Math.floor(Math.random() * 70),
        "PM10": Math.floor(Math.random() * 100),
        "Ozone (O₃)": (Math.random() * 0.1).toFixed(3),
        "Carbon Dioxide (CO₂)": (Math.random() * 500).toFixed(0),
        "Nitrogen Dioxide (NO₂)": (Math.random() * 0.05).toFixed(3),
        "Sulfur Dioxide (SO₂)": (Math.random() * 0.02).toFixed(3),
      }
    }))
  };
}

io.on('connection', (socket) => {
  console.log('🟢 WebSocket client connected');

  const weatherData = generateWeatherForecast();
  socket.emit('weather', weatherData);

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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

app.get('/api/sensors', async (req, res) => {
  try {
    const allData = await SensorData.find().sort({ timestamp: -1 });
    res.json(allData);
  } catch (err) {
    console.error('❌ Error in /api/sensors API:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
