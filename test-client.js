const { io } = require('socket.io-client');

console.log('🚀 Start connecting...');

const socket = io('http://localhost:5084', {
  transports: ['websocket'] // ✅ เพิ่มตรงนี้
});

const testData = {
  TempC: 28.5,
  Hum: 65,
  Windspeed: 1.8,
  pm2_5: 12,
  pm10: 25,
  co: 0.3,
  no2: 0.02,
  so2: 0.01,
  o3: 0.04
};

socket.on('connect', () => {
  console.log('✅ Connected to server');
  socket.emit('sendSensorData', testData);
});

socket.on('newSensorData', (data) => {
  console.log('📡 Received broadcasted data:', data);
  socket.disconnect();
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection Error:', err.message);
});
