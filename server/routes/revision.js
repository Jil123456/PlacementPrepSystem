const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/due-today', revisionController.getDueToday);
router.get('/stats', revisionController.getRevisionStats);
router.post('/rate', revisionController.rateQuestion);

module.exports = router;
