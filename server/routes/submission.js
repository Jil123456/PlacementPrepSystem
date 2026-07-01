const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/result', submissionController.handleResult);

module.exports = router;
