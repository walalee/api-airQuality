const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  pm2_5: { type: Number, required: true },
  pm10: { type: Number, required: true },
  pm1_0: { type: Number, required: true },
  CO: { type: Number, required: true },
  O3: { type: Number, required: true },
  NO2: { type: Number, required: true },
  SO2: { type: Number, required: true },
  Predicted_AQI: { type: Number, required: false }
});


const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData;

