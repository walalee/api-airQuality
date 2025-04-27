const socket = io("ws://localhost:5084");

socket.on("connect", () => {
  console.log("✅ WebSocket connected to backend");
});

function updateSensorUI(data) {
  const { TempC, Hum, Windspeed, pm2_5, pm10, pm1_0, CO, O3, NO2, SO2, timestamp } = data;
  console.log("📡 ได้รับข้อมูลใหม่:", data);

  document.getElementById("pm2.5").textContent = pm2_5 ?? "--";
  document.getElementById("pm10").textContent = pm10 ?? "--";
  document.getElementById("CO").textContent = CO ?? "--";
  document.getElementById("O3").textContent = O3 ?? "--";
  document.getElementById("NO2").textContent = NO2 ?? "--";
  document.getElementById("SO2").textContent = SO2 ?? "--";
}

fetch("http://localhost:5084/latest")
  .then((res) => res.json())
  .then((data) => {
    console.log("📦 โหลดข้อมูลล่าสุดจาก API สำเร็จ");
    updateSensorUI(data);
  })
  .catch((err) => console.error("❌ ดึงข้อมูลล่าสุดไม่สำเร็จ:", err));

socket.on("newSensorData", (data) => {
  updateSensorUI(data);
});

document.addEventListener("DOMContentLoaded", function () {
  let weatherData = null;

  const weekTab = document.getElementById("week-tab");
  const todayTab = document.getElementById("today-tab");
  const tomorrowTab = document.getElementById("tomorrow-tab");
  const forecastContainer = document.getElementById("forecast-container");

  function getWeatherStatusEmoji(status) {
    switch (status.toLowerCase()) {
      case 'clear': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      case 'foggy': return '🌫️';
      default: return '🌥️';
    }
  }

  function getPollutionStatusColor(pm25) {
    if (pm25 <= 25) return "#75c095";
    if (pm25 <= 50) return "#ffdd63";
    return "#ff2d2b";
  }

  function updateMainInfo() {
    if (!weatherData) return;
    document.getElementById("temperature").textContent = `${weatherData.temperature}°C`;
    document.getElementById("humidity").textContent = `${weatherData.humidity}`;
    document.getElementById("windSpeed").textContent = `${weatherData.windSpeed}`;
  }

  function updateHighlights(highlights) {
    const highlightsContainer = document.getElementById("highlights-container");
    highlightsContainer.innerHTML = "";

    if (highlights) {
      console.log("📊 มีข้อมูล highlights:", highlights);
      Object.entries(highlights).forEach(([key, value]) => {
        const div = document.createElement("div");
        div.classList.add("highlight-card");
        div.innerHTML = `<h4>${key}</h4><p>${value}</p>`;
        highlightsContainer.appendChild(div);
      });
    } else {
      console.log("❌ ไม่มีข้อมูล highlights");
    }
  }

  function renderForecast(dayIndex = null) {
    if (!weatherData || !weatherData.forecast) return;
    forecastContainer.innerHTML = "";

    if (dayIndex !== null) {
      const day = weatherData.forecast[dayIndex % 7];
      const div = document.createElement("div");
      div.classList.add("forecast-card");
      const statusEmoji = getWeatherStatusEmoji(day.status);
      const statusColor = getPollutionStatusColor(day.highlights["PM2.5"]);
      div.innerHTML = `<p>${day.day}</p><div style="font-size: 40px;">${statusEmoji}</div><p>${day.temp}°</p>
                       <div class="pollution-status" style="background-color: ${statusColor}; width: 10px; height: 10px; border-radius: 50%;"></div>`;
      forecastContainer.appendChild(div);
      updateHighlights(day.highlights);
    } else {
      weatherData.forecast.forEach((day, index) => {
        const div = document.createElement("div");
        div.classList.add("forecast-card");
        const statusEmoji = getWeatherStatusEmoji(day.status);
        const statusColor = getPollutionStatusColor(day.highlights["PM2.5"]);
        div.innerHTML = `<p>${day.day}</p><div style="font-size: 30px;">${statusEmoji}</div><p>${day.temp}°</p>
                         <div class="pollution-status" style="background-color: ${statusColor}; width: 10px; height: 10px; border-radius: 50%;"></div>`;
        div.addEventListener("click", function () {
          updateHighlights(weatherData.forecast[index].highlights);
        });
        forecastContainer.appendChild(div);
      });
      updateHighlights(weatherData.forecast[0].highlights);
    }
  }

  const socket = io("ws://localhost:5084");

  socket.on("weather", function (data) {
    weatherData = data;
    updateMainInfo();
    renderForecast();
  });

  weekTab.addEventListener("click", function () {
    if (!weatherData) return;
    weekTab.classList.add("active");
    todayTab.classList.remove("active");
    tomorrowTab.classList.remove("active");
    renderForecast();
  });

  todayTab.addEventListener("click", function () {
    if (!weatherData) return;
    todayTab.classList.add("active");
    weekTab.classList.remove("active");
    tomorrowTab.classList.remove("active");
    renderForecast(new Date().getDay());
  });

  tomorrowTab.addEventListener("click", function () {
    if (!weatherData) return;
    tomorrowTab.classList.add("active");
    todayTab.classList.remove("active");
    weekTab.classList.remove("active");
    renderForecast(new Date().getDay() + 1);
  });
});
