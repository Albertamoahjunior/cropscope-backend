const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Protected routes (require admin authentication)
router.use(authenticateAdmin);
router.get('/farmers', adminController.listFarmers);
router.post('/add-farmer', adminController.addFarmer);

module.exports = router;
