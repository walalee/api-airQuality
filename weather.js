// models/weather.js
const mongoose = require('mongoose');

// กำหนด Schema ของข้อมูลสภาพอากาศ
const weatherSchema = new mongoose.Schema({
    date: String,  // วันที่
    city: String,  // ชื่อเมือง
    maxTemp: Number,  // อุณหภูมิสูงสุด
    minTemp: Number,  // อุณหภูมิต่ำสุด
    avgTemp: Number,  // อุณหภูมิเฉลี่ย
    windSpeed: Number,  // ความเร็วลม
    precipitation: Number,  // ปริมาณฝน
    condition: String,  // สภาพอากาศ
});

// สร้าง Model จาก Schema
const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
