const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDSAQuestions, getAptitudeQuestions, getCoreSubjectQuestions, getQuestionById, submitAnswer } = require('../controllers/questionController');

router.get('/dsa', authenticate, getDSAQuestions);
router.get('/aptitude', authenticate, getAptitudeQuestions);
router.get('/core-subjects', authenticate, getCoreSubjectQuestions);
router.get('/:id', authenticate, getQuestionById);
router.post('/:id/answer', authenticate, submitAnswer);

module.exports = router;
