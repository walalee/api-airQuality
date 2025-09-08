require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const AirPollution = require('./airPollution');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

const LAT = 13.87;
const LON = 100.6;

// กำหนดวันที่ต้องการดึงข้อมูล
const dates = [

  "2025-02-27",
  "2025-02-28"

];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ เชื่อมต่อ MongoDB สำหรับ Air Pollution สำเร็จ");

    for (const date of dates) {
      const startOfDay = new Date(`${date}T00:00:00Z`).getTime();
      const endOfDay = new Date(`${date}T23:59:59Z`).getTime();

      // ดึงข้อมูลในแต่ละชั่วโมงจาก 00:00 ถึง 23:00
      for (let hour = 0; hour < 24; hour++) {
        const startTimestamp = startOfDay + (hour * 60 * 60 * 1000); // เพิ่มชั่วโมงในวันนั้น
        const endTimestamp = startTimestamp + (60 * 60 * 1000); // เพิ่ม 1 ชั่วโมงเพื่อเป็นช่วงเวลา end

        const url = `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${LAT}&lon=${LON}&start=${Math.floor(startTimestamp / 1000)}&end=${Math.floor(endTimestamp / 1000)}&appid=${API_KEY}`;

        try {
          const response = await axios.get(url);
          const data = response.data.list;

          if (data.length === 0) {
            console.warn(`⚠️ ไม่มีข้อมูลมลพิษสำหรับ ${date} เวลา ${hour}:00`);
            continue;
          }

          for (const pollution of data) {
            const pollutionData = new AirPollution({
              dateTime: new Date(pollution.dt * 1000),
              pm2_5: pollution.components.pm2_5,
              pm10: pollution.components.pm10,
              co: pollution.components.co,
              no2: pollution.components.no2,
              so2: pollution.components.so2,
              o3: pollution.components.o3,
            });

            await pollutionData.save();
            console.log(`✅ บันทึกข้อมูลมลพิษเวลา ${pollutionData.dateTime.toISOString()} สำเร็จ`);
          }

        } catch (err) {
          console.error(`❌ ดึงข้อมูลจาก OpenWeather ล้มเหลว: ${err.message}`);
        }
      }
    }

    console.log("🎉 เสร็จสิ้นการบันทึกข้อมูลมลพิษทุกช่วงเวลา");
    process.exit(0);

  } catch (err) {
    console.error("❌ ไม่สามารถเชื่อม MongoDB:", err.message);
  }
})();
