const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  }
});

// Protect all resume routes
router.use(authenticate);

// Endpoint for analyzing a resume PDF
router.post('/analyze', upload.single('resume'), resumeController.analyzeResume);

module.exports = router;
