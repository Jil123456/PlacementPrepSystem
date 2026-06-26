const express = require('express');
const router = express.Router();
const { getJobs, addJob, updateJobStatus, deleteJob } = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getJobs);
router.post('/', authenticate, addJob);
router.put('/:id', authenticate, updateJobStatus);
router.delete('/:id', authenticate, deleteJob);

module.exports = router;
