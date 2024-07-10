// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/errorMiddleware');
const adminRoutes = require('./routes/adminRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const testRoutes = require('./routes/testRoutes');
const mqtt_listener = require('./controllers/sensorDataCollection');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});



app.use(cors());
app.use(express.json());

// Routes
app.use('/', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmer', farmerRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
// MongoDB connection
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

//listen for sensor data
mqtt_listener();

// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
