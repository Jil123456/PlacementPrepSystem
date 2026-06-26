const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/me', levelController.getMyLevel);
router.get('/leaderboard', levelController.getLeaderboard);

module.exports = router;
