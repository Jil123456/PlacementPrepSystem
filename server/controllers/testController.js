const { Op } = require('sequelize');
const { Question, UserAnswer, TestResult, Mistake } = require('../models');
const { successResponse, errorResponse, paginate } = require('../utils/helpers');
const levelService = require('../services/levelService');

async function startTest(req, res, next) {
  try {
    const userId = req.user.id;
    const { test_type } = req.query;
    const type = test_type || 'mock';

    const dsaQuestions = await Question.findAll({
      where: { category: 'dsa' },
      attributes: { exclude: ['correct_answer', 'explanation'] },
      order: [sequelize.fn('RANDOM')],
      limit: 2,
    });

    const aptitudeQuestions = await Question.findAll({
      where: { category: 'aptitude' },
      attributes: { exclude: ['correct_answer', 'explanation'] },
      order: [sequelize.fn('RANDOM')],
      limit: 15,
    });

    const coreQuestions = await Question.findAll({
      where: { category: 'core_subject' },
      attributes: { exclude: ['correct_answer', 'explanation'] },
      order: [sequelize.fn('RANDOM')],
      limit: 10,
    });

    const hrQuestions = await Question.findAll({
      where: { category: 'hr' },
      attributes: { exclude: ['correct_answer', 'explanation'] },
      order: [sequelize.fn('RANDOM')],
      limit: 2,
    });

    const questions = [...dsaQuestions, ...aptitudeQuestions, ...coreQuestions, ...hrQuestions];

    const totalTimeSeconds = 90 * 60; // 90 minutes fixed time

    return res.json(successResponse({
      test_type: type,
      total_questions: questions.length,
      total_time_seconds: totalTimeSeconds,
      questions: questions.map((q, index) => ({
        ...q.toJSON(),
        question_number: index + 1,
      })),
    }));
  } catch (error) {
    next(error);
  }
}

async function submitTest(req, res, next) {
  try {
    const userId = req.user.id;
    const { answers, total_time_seconds, test_type } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json(errorResponse('Answers array is required'));
    }

    const questionIds = answers.map((a) => a.question_id);
    const questions = await Question.findAll({
      where: { id: { [Op.in]: questionIds } },
    });

    const questionMap = {};
    for (const q of questions) {
      questionMap[q.id] = q;
    }

    let correctCount = 0;
    const categoryScores = {};
    const answerRecords = [];
    const mistakeRecords = [];

    for (const ans of answers) {
      const question = questionMap[ans.question_id];
      if (!question) continue;

      const isCorrect = String(ans.answer).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase();

      if (isCorrect) correctCount++;

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { total: 0, correct: 0 };
      }
      categoryScores[question.category].total += 1;
      if (isCorrect) categoryScores[question.category].correct += 1;

      answerRecords.push({
        user_id: userId,
        question_id: question.id,
        task_id: null,
        user_answer: ans.answer,
        is_correct: isCorrect,
        time_taken_seconds: ans.time_taken_seconds || null,
        answered_at: new Date(),
      });

      if (!isCorrect) {
        mistakeRecords.push({
          user_id: userId,
          question_id: question.id,
          user_answer: ans.answer,
          correct_answer: question.correct_answer,
        });
      }
    }

    await UserAnswer.bulkCreate(answerRecords);

    if (mistakeRecords.length > 0) {
      await Mistake.bulkCreate(mistakeRecords);
    }

    const categoryScoresFinal = {};
    for (const [cat, data] of Object.entries(categoryScores)) {
      categoryScoresFinal[cat] = {
        total: data.total,
        correct: data.correct,
        accuracy: parseFloat(((data.correct / data.total) * 100).toFixed(1)),
      };
    }

    const testResult = await TestResult.create({
      user_id: userId,
      test_type: test_type || 'mock',
      total_questions: answers.length,
      correct_answers: correctCount,
      total_time_seconds: total_time_seconds || null,
      category_scores: categoryScoresFinal,
      taken_at: new Date(),
    });

    await levelService.addXP(userId, 'mock_test');

    return res.json(successResponse({
      test_result: testResult,
      overall_accuracy: parseFloat(((correctCount / answers.length) * 100).toFixed(1)),
      category_scores: categoryScoresFinal,
    }, 'Test submitted successfully'));
  } catch (error) {
    next(error);
  }
}

async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { limit, offset, page } = paginate(req.query);

    const { count, rows } = await TestResult.findAndCountAll({
      where: { user_id: userId },
      order: [['taken_at', 'DESC']],
      limit,
      offset,
    });

    return res.json(successResponse({
      tests: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    }));
  } catch (error) {
    next(error);
  }
}

async function getTestResult(req, res, next) {
  try {
    const userId = req.user.id;
    const { testId } = req.params;

    const testResult = await TestResult.findOne({
      where: { id: testId, user_id: userId },
    });

    if (!testResult) {
      return res.status(404).json(errorResponse('Test result not found'));
    }

    return res.json(successResponse(testResult));
  } catch (error) {
    next(error);
  }
}

// Need sequelize for RANDOM
const sequelize = require('../config/database');

module.exports = { startTest, submitTest, getHistory, getTestResult };
