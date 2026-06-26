const express = require('express');
const router = express.Router();
const mistakeController = require('../controllers/mistakeController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', mistakeController.getMistakes);
router.put('/:id/revised', mistakeController.markRevised);
router.get('/stats', mistakeController.getMistakeStats);

module.exports = router;
