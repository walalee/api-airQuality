// รอ DOM โหลดก่อนค่อยทำงาน
document.addEventListener("DOMContentLoaded", function () {
    let weatherData = null;

    const weekTab = document.getElementById("week-tab");
    const todayTab = document.getElementById("today-tab");
    const forecastContainer = document.getElementById("forecast-container");

    // แสดงอีโมจิตามสถานะอากาศ
    function getWeatherStatusEmoji(status) {
        if (!status) return '🌥️';
        switch (status.toLowerCase()) {
            case 'clear': return '☀️';
            case 'cloudy': return '☁️';
            case 'rainy': return '🌧️';
            case 'stormy': return '⛈️';
            case 'snowy': return '❄️';
            case 'foggy': return '🌫️';
            default: return '🌥️';
        }
    }

    // สีสถานะ PM2.5
    function getPollutionStatusColor(pm25) {
        if (pm25 <= 25) return "#75c095";
        if (pm25 <= 50) return "#ffdd63";
        return "#ff2d2b";
    }

    // อัปเดตข้อมูลหลัก
    function updateMainInfo() {
        document.getElementById("temperature").textContent = `${weatherData.TempC}°C`;
        document.getElementById("humidity").textContent = `${weatherData.Hum}%`;
        document.getElementById("windSpeed").textContent = `${weatherData.windSpeed} km/h`;
    }

    // อัปเดต Highlights
    function updateHighlights(data) {
        const highlightsContainer = document.getElementById("highlights-container");
        highlightsContainer.innerHTML = "";

        const highlights = {
            "PM2.5": data.pm2_5,
            "PM10": data.pm10,
            "CO": data.co,
            "NO2": data.no2,
            "SO2": data.so2,
            "O3": data.o3,
        };

        Object.entries(highlights).forEach(([key, value]) => {
            const div = document.createElement("div");
            div.classList.add("highlight-card");
            div.innerHTML = `<p>${key}</p><h4>${value} µg/m³</h4>`;
            highlightsContainer.appendChild(div);
        });
    }

    // สร้าง forecast card
    function renderForecast() {
        forecastContainer.innerHTML = "";

        const div = document.createElement("div");
        div.classList.add("forecast-card");
        const emoji = getWeatherStatusEmoji(weatherData.status);
        const pm25Color = getPollutionStatusColor(weatherData.pm2_5);

        div.innerHTML = `
            <p>Today</p>
            <div style="font-size: 40px;">${emoji}</div>
            <p>${weatherData.TempC}°</p>
            <div class="pollution-status" style="background-color: ${pm25Color}; width: 10px; height: 10px; border-radius: 50%;"></div>
        `;
        forecastContainer.appendChild(div);
    }

    // เวลา
    function updateTime() {
        const now = new Date();
        const weekday = now.toLocaleString("en-GB", { weekday: "long" });
        const time = now.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" });
        document.getElementById("time").textContent = `${weekday}, ${time}`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // ✅ เชื่อมต่อ Socket.IO (แก้ port ให้ตรงกับ server.js ที่ใช้ PORT = 5085)
    const socket = io("http://localhost:5085");

    socket.on("connect", () => {
        console.log("✅ Connected to WebSocket");
    });

    socket.on("weather", function (data) {
        console.log("📦 Received data:", data);
        weatherData = data;
        updateMainInfo();
        updateHighlights(data);
        renderForecast();
    });

    weekTab.addEventListener("click", function () {
        weekTab.classList.add("active");
        todayTab.classList.remove("active");
        renderForecast();
    });

    todayTab.addEventListener("click", function () {
        todayTab.classList.add("active");
        weekTab.classList.remove("active");
        renderForecast();
    });
});
