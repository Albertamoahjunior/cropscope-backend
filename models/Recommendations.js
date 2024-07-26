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
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  condition: {
    type: String,
    default: "all conditions are optimal",
  },
  disease: {
    type: String,
    required: true,
  },
  suggestion:{
    type: String,
    required: true,
    default: "Continue to keep your farm in good shape",
  },
  farmerID: {
    type: String,
    required: true,
  },
});

// Static method to fetch recommendations in ascending order
RecommendationsSchema.statics.fetchRecommendations = function() {
  return this.find().sort({ timestamp: -1 }).exec();
};

const Recommendations = mongoose.model('Recommendations', RecommendationsSchema);
module.exports = Recommendations;

