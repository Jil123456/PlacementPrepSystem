const express = require('express');
const router = express.Router();
const companyModeController = require('../controllers/companyModeController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/options', companyModeController.getOptions);
router.post('/select', companyModeController.selectMode);
router.get('/roadmap', companyModeController.getModeRoadmap);

module.exports = router;
