const axios = require('axios');
const mongoose = require('mongoose');
const Weather = require('./weather');  // นำเข้า Model

const API_KEY = 'da1e7bcbba7a4957bd863032250104';  // ใส่ API Key ของคุณ
const LAT = 13.87;  // ละติจูด (กรุงเทพฯ)
const LON = 100.6;
const BASE_URL = "https://api.weatherapi.com/v1/history.json";

mongoose.connect('mongodb+srv://walaleemauenjit:cpe495air@cluster0.puumjnp.mongodb.net/weatherDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('เชื่อมต่อ MongoDB Atlas สำเร็จ!');
}).catch((error) => {
    console.error('ไม่สามารถเชื่อมต่อ MongoDB:', error);
});

// ฟังก์ชันดึงข้อมูลและบันทึกลง MongoDB
async function getWeatherAndSave() {
    const dates = [
        "2025-03-29", "2025-03-30", "2025-03-31"
    ];

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const url = `${BASE_URL}?key=${API_KEY}&q=${LAT},${LON}&dt=${date}`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            // Loop ผ่านข้อมูล hourly เพื่อดึงข้อมูลแต่ละช่วงเวลา
            for (let hourData of data.forecast.forecastday[0].hour) {
                // สร้าง Object สำหรับข้อมูลที่ต้องการเก็บ
                const weatherData = new Weather({
                    date: data.forecast.forecastday[0].date,
                    time: hourData.time,  // เวลา
                    tempC: hourData.temp_c,  // อุณหภูมิ
                    tempF: hourData.temp_f,  // อุณหภูมิฟาเรนไฮต์
                    condition: hourData.condition.text,  // สภาพอากาศ
                    windSpeedKph: hourData.wind_kph,  // ความเร็วลม (กม./ชม.)
                    windSpeedMph: hourData.wind_mph,  // ความเร็วลม (ไมล์/ชม.)
                    humidity: hourData.humidity,  // ความชื้น
                    precipitation: hourData.precip_mm,  // ปริมาณน้ำฝน (มม.)
                    pressure: hourData.pressure_mb,  // ความดัน
                    feelsLikeC: hourData.feelslike_c,  // อุณหภูมิที่รู้สึก
                });

                // บันทึกข้อมูลลง MongoDB
                await weatherData.save();
                console.log(`บันทึกข้อมูลสภาพอากาศช่วงเวลา ${hourData.time} สำเร็จ!`);
            }

        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหรือบันทึก:', error.message);
        }
    }
}

// เรียกใช้ฟังก์ชันเพื่อดึงข้อมูลและบันทึก
getWeatherAndSave();
