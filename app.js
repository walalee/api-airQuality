// app.js
const axios = require('axios');
const mongoose = require('mongoose');
const Weather = require('./weather');  // นำเข้า Model

const API_KEY = 'da1e7bcbba7a4957bd863032250104';  // ใส่ API Key ของคุณ
const LAT = 13.87;  // ละติจูด (กรุงเทพฯ)
const LON = 100.6; 
const BASE_URL = `https://api.weatherapi.com/v1/history.json`;

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb://localhost:27017/weatherDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('เชื่อมต่อ MongoDB สำเร็จ!');
}).catch((error) => {
    console.error('ไม่สามารถเชื่อมต่อ MongoDB:', error);
});

// ฟังก์ชันดึงข้อมูลและบันทึกลง MongoDB
async function getWeatherAndSave() {
    const dates = [
        "2025-03-01", "2025-03-02", "2025-03-03", "2025-03-04", "2025-03-05", "2025-03-06", "2025-03-07"
    ];

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const url = `${BASE_URL}?key=${API_KEY}&q=${LAT},${LON}&dt=${date}`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            // สร้าง Object สำหรับข้อมูลที่ต้องการเก็บ
            const weatherData = new Weather({
                date: data.forecast.forecastday[0].date,
                city: `Lat: ${LAT}, Lon: ${LON}`,
                maxTemp: data.forecast.forecastday[0].day.maxtemp_c,
                minTemp: data.forecast.forecastday[0].day.mintemp_c,
                avgTemp: data.forecast.forecastday[0].day.avgtemp_c,
                windSpeed: data.forecast.forecastday[0].day.maxwind_kph,
                precipitation: data.forecast.forecastday[0].day.totalprecip_mm,
                condition: data.forecast.forecastday[0].day.condition.text,
            });

            // บันทึกข้อมูลลง MongoDB
            await weatherData.save();
            console.log(`บันทึกข้อมูลสภาพอากาศวันที่ ${date} สำเร็จ!`);

        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหรือบันทึก:', error.message);
        }
    }
}

// เรียกใช้ฟังก์ชันเพื่อดึงข้อมูลและบันทึก
getWeatherAndSave();
