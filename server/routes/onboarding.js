const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/assessment', onboardingController.getAssessment);
router.post('/complete', onboardingController.completeOnboarding);

module.exports = router;
