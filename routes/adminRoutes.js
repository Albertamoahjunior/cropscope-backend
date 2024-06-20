// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', adminController.signup);
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get('/list-farmers', adminController.listFarmers);
router.post('/add-farmer', adminController.addFarmer);
router.delete('/remove-farmer/:id', adminController.removeFarmer);

module.exports = router;
