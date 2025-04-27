document.addEventListener("DOMContentLoaded", function () {
    let weatherData = null;

    const weekTab = document.getElementById("week-tab");
    const todayTab = document.getElementById("today-tab");
    const tomorrowTab = document.getElementById("tomorrow-tab"); // เพิ่มตัวแปรนี้
    const forecastContainer = document.getElementById("forecast-container");

    // ฟังก์ชันเพื่อแปลงสถานะเป็นอิโมจิ
    function getWeatherStatusEmoji(status) {
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

    // ฟังก์ชันเพื่อแปลง PM2.5 เป็นสี
    function getPollutionStatusColor(pm25) {
        if (pm25 <= 25) return "#75c095";   // เขียว
        if (pm25 <= 50) return "#ffdd63";   // เหลือง
        return "#ff2d2b";                   // แดง
    }

    // ฟังก์ชันอัปเดตข้อมูลหลัก
    function updateMainInfo() {
        document.getElementById("temperature").textContent = `${weatherData.temperature}°C`;
        document.getElementById("humidity").textContent = `${weatherData.humidity}`;
        document.getElementById("windSpeed").textContent = `${weatherData.windSpeed}`;
    }

    // ฟังก์ชันแสดงข้อมูลพยากรณ์
    function renderForecast(dayIndex = null) {
        if (!weatherData || !weatherData.forecast) {
            console.log("❌ ไม่มีข้อมูล forecast");
            return;
        }
    
        forecastContainer.innerHTML = "";
    
        if (dayIndex !== null) {
            const day = weatherData.forecast[dayIndex % 7];
            const div = document.createElement("div");
            div.classList.add("forecast-card");
            const statusEmoji = getWeatherStatusEmoji(day.status);
            const statusColor = getPollutionStatusColor(day.highlights["PM2.5"]);
            div.innerHTML = `
                <p>${day.day}</p>
                <div style="font-size: 40px;">${statusEmoji}</div>
                <p>${day.temp}°</p>
                <div class="pollution-status" style="background-color: ${statusColor}; width: 10px; height: 10px; border-radius: 50%;"></div>`;
            forecastContainer.appendChild(div);
            updateHighlights(day.highlights);
        } else {
            weatherData.forecast.forEach((day, index) => {
                const div = document.createElement("div");
                div.classList.add("forecast-card");
                const statusEmoji = getWeatherStatusEmoji(day.status);
                const statusColor = getPollutionStatusColor(day.highlights["PM2.5"]);
                div.innerHTML = `
                    <p>${day.day}</p>
                    <div style="font-size: 30px;">${statusEmoji}</div>
                    <p>${day.temp}°</p>
                    <div class="pollution-status" style="background-color: ${statusColor}; width: 10px; height: 10px; border-radius: 50%;"></div>`;
                div.addEventListener("click", function () {
                    updateHighlights(weatherData.forecast[index].highlights);
                });
                forecastContainer.appendChild(div);
            });
            updateHighlights(weatherData.forecast[2].highlights); // Default: วันพุธ
        }
    }

    // ฟังก์ชันอัปเดตข้อมูล Highlights
    function updateHighlights(highlights) {
        const highlightsContainer = document.getElementById("highlights-container");
        highlightsContainer.innerHTML = "";

        if (highlights) {
            console.log("📊 มีข้อมูล highlights:", highlights);
            Object.entries(highlights).forEach(([key, value]) => {
                const div = document.createElement("div");
                div.classList.add("highlight-card");
                div.innerHTML = `<p>${key}</p><h4>${value} µg/m³</h4>`;
                highlightsContainer.appendChild(div);
            });
        } else {
            console.log("❌ ไม่มีข้อมูล highlights");
        }
    }

    // ฟังก์ชันอัปเดตเวลา
    function updateTime() {
        const now = new Date();
        const weekday = now.toLocaleString("en-GB", { weekday: "long" });
        const time = now.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" });
        document.getElementById("time").textContent = `${weekday}, ${time}`;
    }

    setInterval(updateTime, 1000);
    updateTime();

    // WebSocket เชื่อมต่อ
    const socket = io("ws://localhost:5084");

    socket.on("weather", function (data) {
        weatherData = data;
        updateMainInfo();
        renderForecast();
    });

    // ✅ เพิ่มการควบคุมการสลับแท็บ
    weekTab.addEventListener("click", function () {
        if (!weatherData) return;
        weekTab.classList.add("active");
        todayTab.classList.remove("active");
        tomorrowTab.classList.remove("active");
        renderForecast(); // แสดงสัปดาห์
    });

    todayTab.addEventListener("click", function () {
        if (!weatherData) return;
        todayTab.classList.add("active");
        weekTab.classList.remove("active");
        tomorrowTab.classList.remove("active");
        renderForecast(new Date().getDay()); // แสดงวันนี้
    });

    tomorrowTab.addEventListener("click", function () {
        if (!weatherData) return;
        tomorrowTab.classList.add("active");
        todayTab.classList.remove("active");
        weekTab.classList.remove("active");
        renderForecast((new Date().getDay() + 1) % 7); // แสดงพรุ่งนี้
    });
});
