const { RevisionSchedule, RoadmapDay, Task, Question } = require('../models');

const { Op } = require('sequelize');

async function getTodayRevisionTasks(userId, currentDay) {
  const revisions = await RevisionSchedule.findAll({
    where: {
      user_id: userId,
      next_revision_date: { [Op.lte]: new Date() },
      is_completed: false,
    },
    include: [{ model: Question, as: 'question' }],
  });

  if (revisions.length === 0) {
    return { revisions: [], roadmapDays: [] };
  }

  return { revisions, roadmapDays: [] };
}

async function getRevisionCompletionRate(userId) {
  const total = await RevisionSchedule.count({ where: { user_id: userId } });
  if (total === 0) return { rate: 100, completed: 0, total: 0 };

  const completed = await RevisionSchedule.count({
    where: { user_id: userId, is_completed: true },
  });

  return {
    rate: parseFloat(((completed / total) * 100).toFixed(1)),
    completed,
    total,
  };
}

module.exports = { getTodayRevisionTasks, getRevisionCompletionRate };
