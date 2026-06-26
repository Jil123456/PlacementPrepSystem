const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/dashboard', progressController.getDashboard);
router.get('/roadmap', progressController.getRoadmap);
router.get('/weakness', progressController.getWeakness);
router.post('/unlock-next', progressController.unlockNextDay);

module.exports = router;
