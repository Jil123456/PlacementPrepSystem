const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/schedule', revisionController.getSchedule);
router.get('/today', revisionController.getTodayRevision);
router.post('/:id/complete', revisionController.completeRevision);

module.exports = router;
