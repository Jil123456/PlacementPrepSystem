const { RevisionSchedule, RevisionSession, Question } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');
const revisionService = require('../services/revisionService');
const weaknessService = require('../services/weaknessService');
const { Op } = require('sequelize');

async function getDueToday(req, res, next) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const revisions = await RevisionSchedule.findAll({
      where: {
        user_id: userId,
        next_revision_date: { [Op.lte]: today },
        mastered: false,
      },
      include: [{ model: Question, as: 'question' }],
    });

    const cards = revisions.map(r => {
      const msOverdue = Date.now() - new Date(r.next_revision_date).getTime();
      const daysOverdue = Math.max(0, Math.floor(msOverdue / (1000 * 60 * 60 * 24)));
      return {
        question_id: r.question.id,
        title: r.question.title,
        topic: r.question.category,
        difficulty: r.question.difficulty,
        repetitions: r.repetitions,
        easiness_factor: r.easiness_factor,
        interval_days: r.interval,
        days_overdue: daysOverdue
      };
    });

    return res.json(successResponse({ cards }));
  } catch (error) {
    next(error);
  }
}

async function getRevisionStats(req, res, next) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueToday = await RevisionSchedule.count({
      where: {
        user_id: userId,
        next_revision_date: { [Op.lte]: today },
        mastered: false,
      }
    });

    const mastered = await RevisionSchedule.count({
      where: { user_id: userId, mastered: true }
    });

    // Mock weak topics logic or use weaknessService
    const { weak_topics } = await weaknessService.detectWeakness(userId);
    const formattedWeakTopics = weak_topics.map(t => ({
      topic: t.topic,
      avg_quality: 2.0 // Dummy value, actual logic would query RevisionSession averages
    }));

    return res.json(successResponse({
      due_today: dueToday,
      mastered: mastered,
      weak_topics: formattedWeakTopics
    }));
  } catch (error) {
    next(error);
  }
}

async function rateQuestion(req, res, next) {
  try {
    const userId = req.user.id;
    const { question_id, quality, context } = req.body;

    if (quality === undefined) return res.status(400).json(errorResponse('Missing quality rating'));

    let revision = await RevisionSchedule.findOne({ where: { user_id: userId, question_id } });
    
    if (!revision) {
      const { newInterval, newRepetitions, newEF } = revisionService.calculateSM2(quality, 0, 0, 2.5);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + newInterval);

      revision = await RevisionSchedule.create({
        user_id: userId,
        question_id,
        interval: newInterval,
        repetitions: newRepetitions,
        easiness_factor: newEF,
        next_revision_date: nextDate,
        mastered: newInterval > 21
      });

      await RevisionSession.create({
        user_id: userId, question_id, quality,
        interval_before: 0, interval_after: newInterval,
        ef_before: 2.5, ef_after: newEF
      });
    } else {
      revision = await revisionService.processRevisionRating(revision.id, userId, quality);
    }

    // New API Contract format
    return res.json({
      success: true,
      data: {
        interval_after: revision.interval,
        mastered: revision.mastered,
        due_date: revision.next_revision_date.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDueToday, getRevisionStats, rateQuestion };
