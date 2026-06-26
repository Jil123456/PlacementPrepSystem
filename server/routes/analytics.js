const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/readiness', analyticsController.getReadiness);
router.get('/weekly-report', analyticsController.getWeeklyReport);
router.get('/accuracy-trend', analyticsController.getAccuracyTrend);
router.get('/topic-performance', analyticsController.getTopicPerformance);
router.get('/dropoff-alert', analyticsController.getDropoffAlert);
router.get('/heatmap', analyticsController.getHeatmapData);

module.exports = router;
