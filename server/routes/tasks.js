const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/today', taskController.getTodayTasks);
router.get('/day/:dayNumber', taskController.getDayTasks);
router.get('/leetcode/:titleSlug', taskController.getLeetcodeContent);
router.post('/:taskId/replace', taskController.replaceTask);
router.get('/:taskId', taskController.getTaskDetails);
router.post('/:taskId/complete', taskController.completeTask);

module.exports = router;
