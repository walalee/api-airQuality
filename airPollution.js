const mongoose = require('mongoose');

const pollutionSchema = new mongoose.Schema({
  dateTime: { type: Date, required: true },
  pm2_5: Number,
  pm10: Number,
  co: Number,
  no2: Number,
  so2: Number,
  o3: Number,
});

const AirPollution = mongoose.model('AirPollution', pollutionSchema);

module.exports = AirPollution;
