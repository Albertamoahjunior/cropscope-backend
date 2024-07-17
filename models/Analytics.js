const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  farmerID: {
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

// Helper function to get start and end of the current day
function getDayRange(date) {
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  return { startOfDay, endOfDay };
}

// Static method to get average values for every 10 minutes in a day
AnalyticsSchema.statics.getToday = async function(farmerID) {
  const { startOfDay, endOfDay } = getDayRange(new Date());

  const result = await this.aggregate([
    { $match: { farmerID, timestamp: { $gte: startOfDay, $lt: endOfDay } } },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' },
          minute: { $subtract: [{ $minute: '$timestamp' }, { $mod: [{ $minute: '$timestamp' }, 10] }] } // Group by 10-minute intervals
        },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1, '_id.minute': 1 } }
  ]);

  return result;
};


// Static method to get average values and latest timestamp for today
AnalyticsSchema.statics.getAveragesForToday = async function(farmerID) {
  const { startOfDay, endOfDay } = getDayRange(new Date());

  const result = await this.aggregate([
    { $match: { farmerID, timestamp: { $gte: startOfDay, $lt: endOfDay } } },
    {
      $group: {
        _id: null,
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
        latestTimestamp: { $max: '$timestamp' }
      }
    }
  ]);

  return result.length ? result[0] : null;
};

// Static method to get average values for each day in the current week
AnalyticsSchema.statics.getAveragesForWeek = async function(farmerID) {
  const today = new Date();
  const startOfWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay(), 0, 0, 0));

  const result = await this.aggregate([
    { $match: { farmerID, timestamp: { $gte: startOfWeek } } },
    {
      $group: {
        _id: { $dayOfWeek: '$timestamp' },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return result;
};

// Static method to get average values for each week in the current month
AnalyticsSchema.statics.getAveragesForMonth = async function(farmerID) {
  const today = new Date();
  const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 0, 0, 0));

  const result = await this.aggregate([
    { $match: { farmerID, timestamp: { $gte: startOfMonth } } },
    {
      $group: {
        _id: { $week: '$timestamp' },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return result;
};

// Static method to get average values for each month in the current year
AnalyticsSchema.statics.getAveragesForYear = async function(farmerID) {
  const today = new Date();
  const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1, 0, 0, 0));

  const result = await this.aggregate([
    { $match: { farmerID, timestamp: { $gte: startOfYear } } },
    {
      $group: {
        _id: { $month: '$timestamp' },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return result;
};

// Static method to get average values for each day in the year so far
AnalyticsSchema.statics.getAveragesForYearSoFar = async function(farmerID) {
  const today = new Date();
  const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1, 0, 0, 0));

  const result = await this.aggregate([
    { $match: { farmerID, timestamp: { $gte: startOfYear } } },
    {
      $group: {
        _id: { $dayOfYear: '$timestamp' },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return result;
};

// Static method to get average values for each year so far
AnalyticsSchema.statics.getAveragesForEachYear = async function(farmerID) {
  const result = await this.aggregate([
    { $match: { farmerID } },
    {
      $group: {
        _id: { $year: '$timestamp' },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return result;
};

// Static method to get average values for each month so far
AnalyticsSchema.statics.getAveragesForEachMonth = async function(farmerID) {
  const result = await this.aggregate([
    { $match: { farmerID } },
    {
      $group: {
        _id: { $year: '$timestamp', $month: '$timestamp' },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return result;
};

// Static method to get average values for each day so far
AnalyticsSchema.statics.getAveragesForEachDay = async function(farmerID) {
  const result = await this.aggregate([
    { $match: { farmerID } },
    {
      $group: {
        _id: { $year: '$timestamp', $month: '$timestamp', $day: '$timestamp' },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return result;
};

// Static method to get average values for each week so far
AnalyticsSchema.statics.getAveragesForEachWeek = async function(farmerID) {
  const result = await this.aggregate([
    { $match: { farmerID } },
    {
      $group: {
        _id: { $year: '$timestamp', $week: { $week: '$timestamp' } },
        averageAtmosphericTemperature: { $avg: '$atmosphericTemperature' },
        averageAtmosphericHumidity: { $avg: '$atmosphericHumidity' },
        averageSoilMoisture: { $avg: '$soilMoisture' },
        averageSoilPH: { $avg: '$soilPH' },
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  return result;
};

const Analytics = mongoose.model('Analytics', AnalyticsSchema);
module.exports = Analytics;
