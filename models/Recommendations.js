const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const RecommendationsSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  recommendations: [RecommendationSchema],
});

const Recommendations = mongoose.model('Recommendations', RecommendationsSchema);
module.exports = Recommendations;
