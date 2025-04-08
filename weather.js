const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    tempC: { type: Number, required: true },
    tempF: { type: Number, required: true },
    condition: { type: String, required: true },
    windSpeedKph: { type: Number },
    windSpeedMph: { type: Number },
    humidity: { type: Number },
    precipitation: { type: Number },
    pressure: { type: Number },
    feelsLikeC: { type: Number },
});

const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
