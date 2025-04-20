require('dotenv').config();
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const SensorData = require('./db');
const express = require('express');
const app = express();

// เชื่อม MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Connected');
}).catch(err => console.error(err));

// เชื่อม MQTT Broker
const client = mqtt.connect(process.env.MQTT_BROKER);

// Sub topic ตอนเชื่อมต่อ
client.on('connect', () => {
  console.log('✅ MQTT Connected');
  client.subscribe(process.env.MQTT_TOPIC, (err) => {
    if (!err) console.log(`📡 Subscribed to topic: ${process.env.MQTT_TOPIC}`);
  });
});

// รับข้อมูลจาก MQTT และบันทึกลง MongoDB
client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString()); // แปลงเป็น object
    const newSensorData = new SensorData(data);
    await newSensorData.save();
    console.log('📥 Saved sensor data:', data);
  } catch (err) {
    console.error('❌ Error saving data:', err);
  }
});

// (Optional) เผื่อมี API เช็กล่าสุด
app.get('/latest', async (req, res) => {
  const latest = await SensorData.find().sort({ timestamp: -1 }).limit(1);
  res.json(latest[0]);
});

// Run express server เผื่ออยากใช้ร่วม
const PORT = process.env.PORT || 5084;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
