require('dotenv').config(); // โหลด .env
const axios = require('axios');
const mongoose = require('mongoose');
const Weather = require('./weather');  // นำเข้า Model

// โหลดค่าจาก .env
const API_KEY = process.env.WEATHER_API_KEY || 'da1e7bcbba7a4957bd863032250104';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://walaleemauenjit:ITQDYaNhAw3wbR6h@cluster0.puumjnp.mongodb.net/weatherDB?retryWrites=true&w=majority';

const LAT = 13.87;
const LON = 100.6;
const BASE_URL = "https://api.weatherapi.com/v1/history.json";

// ===== เชื่อมต่อ MongoDB =====
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ เชื่อมต่อ MongoDB Atlas สำเร็จ!');
    getWeatherAndSave(); // เรียกฟังก์ชันเมื่อเชื่อมต่อสำเร็จ
  } catch (error) {
    console.error('❌ ไม่สามารถเชื่อมต่อ MongoDB:', error.message);
  }
})();

// ===== ฟังก์ชันดึงข้อมูลและบันทึกลง MongoDB =====
async function getWeatherAndSave() {
  const dates = ["2025-02-22", "2025-02-23", "2025-02-24","2025-02-25","2025-02-26", "2025-02-27","2025-02-28"];

  for (const date of dates) {
    const url = `${BASE_URL}?key=${API_KEY}&q=${LAT},${LON}&dt=${date}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      for (const hourData of data.forecast.forecastday[0].hour) {
        const weatherData = new Weather({
          date: data.forecast.forecastday[0].date,
          time: hourData.time,
          tempC: hourData.temp_c,
          tempF: hourData.temp_f,
          condition: hourData.condition.text,
          windSpeedKph: hourData.wind_kph,
          windSpeedMph: hourData.wind_mph,
          humidity: hourData.humidity,
          precipitation: hourData.precip_mm,
          pressure: hourData.pressure_mb,
          feelsLikeC: hourData.feelslike_c,
        });

        await weatherData.save();
        console.log(`✅ บันทึกข้อมูลสภาพอากาศช่วงเวลา ${hourData.time} สำเร็จ`);
      }

    } catch (error) {
      console.error(`⚠️ ดึงหรือบันทึกข้อมูลวันที่ ${date} ล้มเหลว:`, error.message);
    }
  }

  console.log('🎉 เสร็จสิ้นการบันทึกข้อมูลทั้งหมด!');
}
