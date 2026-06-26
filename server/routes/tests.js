const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/start', testController.startTest);
router.post('/:testId/submit', testController.submitTest);
router.get('/history', testController.getHistory);
router.get('/:testId/result', testController.getTestResult);

module.exports = router;
