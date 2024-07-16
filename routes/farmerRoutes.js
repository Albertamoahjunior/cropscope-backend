// routes/farmerRoutes.js
const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/login', farmerController.login);
router.post('/forgot-password', farmerController.forgotPassword);
router.post('/reset-password/:token', farmerController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.post('/data-analysis', farmerController.dataAnalysis);
router.post('/update-phone', farmerController.updatePhone);
router.post('/overview',farmerController.fetchOverviewData);
router.post('/fetch-data-analytics',farmerController.fetchDataAnalytics);

module.exports = router;
