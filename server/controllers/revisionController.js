const { RevisionSchedule, RoadmapDay, Task, Question } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');
const revisionService = require('../services/revisionService');

async function getSchedule(req, res, next) {
  try {
    const userId = req.user.id;
    const { Op } = require('sequelize');

    const revisions = await RevisionSchedule.findAll({
      where: { 
        user_id: userId,
        is_completed: false,
        target_roadmap_day: { [Op.lte]: req.user.current_day }
      },
      include: [{ model: Question, as: 'question' }],
      order: [['next_revision_date', 'ASC']],
    });

    return res.json(successResponse({ revisions }));
  } catch (error) {
    next(error);
  }
}

async function getTodayRevision(req, res, next) {
  try {
    const userId = req.user.id;
    const currentDay = req.user.current_day;

    const result = await revisionService.getTodayRevisionTasks(userId, currentDay);

    return res.json(successResponse({
      current_day: currentDay,
      revisions: result.revisions,
      revision_days: result.roadmapDays,
    }));
  } catch (error) {
    next(error);
  }
}

async function completeRevision(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const revision = await RevisionSchedule.findOne({
      where: { id: id, user_id: userId },
    });

    if (!revision) {
      return res.status(404).json(errorResponse('Revision entry not found'));
    }

    if (revision.is_completed) {
      return res.status(409).json(errorResponse('Revision already completed'));
    }

    revision.is_completed = true;
    revision.completed_at = new Date();
    await revision.save();

    const completionRate = await revisionService.getRevisionCompletionRate(userId);

    return res.json(successResponse({
      revision,
      completion_rate: completionRate,
    }, 'Revision completed'));
  } catch (error) {
    next(error);
  }
}

async function rateQuestion(req, res, next) {
  try {
    const userId = req.user.id;
    const { question_id, quality } = req.body;

    if (quality === undefined) return res.status(400).json(errorResponse('Missing quality rating'));

    let revision = await RevisionSchedule.findOne({ where: { user_id: userId, question_id } });
    
    if (!revision) {
      const { RevisionSession } = require('../models');
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

    const completionRate = await revisionService.getRevisionCompletionRate(userId);

    return res.json(successResponse({
      revision,
      completion_rate: completionRate,
    }, 'Revision rated successfully'));
  } catch (error) {
    next(error);
  }
}

module.exports = { getSchedule, getTodayRevision, completeRevision, rateQuestion };
