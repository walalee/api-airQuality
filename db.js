const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  TempC: { type: Number, required: true },
  Hum: { type: Number, required: true },
  Windspeed: { type: Number, required: true },
  pm2_5: { type: Number, required: true },
  pm10: { type: Number, required: true },
  co: { type: Number, required: true },
  no2: { type: Number, required: true },
  so2: { type: Number, required: true },
  o3: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('SensorData', SensorDataSchema);
