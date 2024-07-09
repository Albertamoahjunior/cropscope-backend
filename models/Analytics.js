const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  atmosphericTemperature: {
    type: Number,
    required: true,
  },
  atmosphericHumidity: {
    type: Number,
    required: true,
  },
  soilMoisture: {
    type: Number,
    required: true,
  },
  soilPH: {
    type: Number,
    required: true,
  },
});

const Analytics = mongoose.model('Analytics', AnalyticsSchema);
module.exports = Analytics;