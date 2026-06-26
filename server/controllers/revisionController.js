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
        next_revision_date: { [Op.lte]: new Date() }
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
    const { revisionId } = req.params;

    const revision = await RevisionSchedule.findOne({
      where: { id: revisionId, user_id: userId },
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

module.exports = { getSchedule, getTodayRevision, completeRevision };
