const { Op } = require('sequelize');
const { Question, UserAnswer, Mistake } = require('../models');
const { successResponse, errorResponse, paginate } = require('../utils/helpers');
const levelService = require('../services/levelService');

async function getDSAQuestions(req, res, next) {
  try {
    const { subcategory, difficulty, tags } = req.query;
    const { limit, offset, page } = paginate(req.query);

    const where = { category: 'dsa' };
    if (subcategory) where.subcategory = subcategory;
    if (difficulty) where.difficulty = difficulty;

    const { count, rows } = await Question.findAndCountAll({
      where,
      attributes: { exclude: ['correct_answer', 'explanation'] },
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return res.json(successResponse({
      questions: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    }));
  } catch (error) {
    next(error);
  }
}

async function getAptitudeQuestions(req, res, next) {
  try {
    const { subcategory, difficulty } = req.query;
    const { limit, offset, page } = paginate(req.query);

    const where = { category: 'aptitude' };
    if (subcategory) where.subcategory = subcategory;
    if (difficulty) where.difficulty = difficulty;

    const { count, rows } = await Question.findAndCountAll({
      where,
      attributes: { exclude: ['correct_answer', 'explanation'] },
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return res.json(successResponse({
      questions: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    }));
  } catch (error) {
    next(error);
  }
}

async function getQuestionById(req, res, next) {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id, {
      attributes: { exclude: ['correct_answer', 'explanation'] },
    });

    if (!question) {
      return res.status(404).json(errorResponse('Question not found'));
    }

    return res.json(successResponse(question));
  } catch (error) {
    next(error);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const { questionId } = req.params;
    const { answer, time_taken_seconds } = req.body;
    const userId = req.user.id;

    if (!answer) {
      return res.status(400).json(errorResponse('Answer is required'));
    }

    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json(errorResponse('Question not found'));
    }

    let isCorrect = true;
    let feedback = "";
    let correctAns = question.correct_answer;
    let explanation = question.explanation;

    // Determine if it's an MCQ
    let isMCQ = false;
    try {
      if (question.options) {
        const parsed = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
        if (parsed && (Array.isArray(parsed) || Object.keys(parsed).length > 0)) {
          isMCQ = true;
        }
      }
    } catch (e) {}

    if (isMCQ) {
      isCorrect = String(answer).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase();
      feedback = isCorrect ? "Correct!" : `Incorrect. The correct answer was ${question.correct_answer}.`;
    } else if (question.category === 'hr' || question.category === 'aptitude') {
      const aiEvaluator = require('../services/aiEvaluator');
      const evalResult = await aiEvaluator.evaluateAnswer(
        question.title,
        answer || "(No Answer)",
        question.category,
        question.correct_answer
      );
      isCorrect = evalResult.isCorrect;
      feedback = evalResult.feedback;
      correctAns = evalResult.idealAnswer;
      explanation = evalResult.explanation || feedback;
    } else {
      isCorrect = String(answer).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase();
    }

    const userAnswer = await UserAnswer.create({
      user_id: userId,
      question_id: question.id,
      task_id: null,
      user_answer: answer,
      is_correct: isCorrect,
      time_taken_seconds: time_taken_seconds || null,
      answered_at: new Date(),
    });

    if (!isCorrect) {
      await Mistake.create({
        user_id: userId,
        question_id: question.id,
        user_answer: answer,
        correct_answer: correctAns,
      });
    }

    if (isCorrect) {
      await levelService.addXP(userId, 'correct_answer');
      
      // Auto-resolve any existing mistake for this question
      const MistakeModel = require('../models').Mistake;
      await MistakeModel.update(
        { is_revised: true, revised_at: new Date() },
        { where: { user_id: userId, question_id: question.id, is_revised: false } }
      );
    }

    return res.json(successResponse({
      is_correct: isCorrect,
      correct_answer: correctAns,
      explanation: explanation,
      feedback: feedback,
      user_answer: answer,
    }, isCorrect ? 'Correct!' : 'Incorrect'));
  } catch (error) {
    next(error);
  }
}

async function getCoreSubjectQuestions(req, res, next) {
  try {
    const { subcategory, difficulty } = req.query;
    const { limit, offset, page } = paginate(req.query);

    const where = { category: 'core_subject' };
    if (subcategory && subcategory !== 'all') where.subcategory = subcategory;
    if (difficulty && difficulty !== 'all') where.difficulty = difficulty;

    const { count, rows } = await Question.findAndCountAll({
      where,
      attributes: { exclude: ['correct_answer', 'explanation'] },
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return res.json(successResponse({
      questions: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = { getDSAQuestions, getAptitudeQuestions, getCoreSubjectQuestions, getQuestionById, submitAnswer };
