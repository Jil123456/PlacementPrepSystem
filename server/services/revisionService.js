const { RevisionSchedule, RevisionSession, RoadmapDay, Task, Question } = require('../models');
const { Op } = require('sequelize');

async function getTodayRevisionTasks(userId, currentDay) {
  // Query: next_revision_date <= TODAY AND mastered = false
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

  return { revisions, roadmapDays: [] };
}

function calculateSM2(quality, repetitions, interval, easinessFactor) {
  // quality: 0=Again, 2=Hard, 4=Good, 5=Easy
  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEF = easinessFactor;

  if (quality >= 3) {
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEF);
    }
    newRepetitions += 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEF = newEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  return { newInterval, newRepetitions, newEF };
}

async function processRevisionRating(revisionId, userId, quality) {
  const revision = await RevisionSchedule.findOne({
    where: { id: revisionId, user_id: userId },
  });

  if (!revision) return null;

  const { newInterval, newRepetitions, newEF } = calculateSM2(
    quality,
    revision.repetitions,
    revision.interval,
    revision.easiness_factor
  );

  // Log session
  await RevisionSession.create({
    user_id: userId,
    question_id: revision.question_id,
    quality,
    interval_before: revision.interval,
    interval_after: newInterval,
    ef_before: revision.easiness_factor,
    ef_after: newEF,
  });

  revision.repetitions = newRepetitions;
  revision.interval = newInterval;
  revision.easiness_factor = newEF;

  if (newInterval > 21) {
    revision.mastered = true;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);
  revision.next_revision_date = nextDate;

  // For compatibility with old code, we'll set is_completed to true temporarily,
  // but it's not strictly needed for SM-2 since next_revision_date is pushed forward.
  // We'll just push next_revision_date forward.
  revision.is_completed = false; 

  await revision.save();

  return revision;
}

async function getRevisionCompletionRate(userId) {
  const total = await RevisionSchedule.count({ where: { user_id: userId } });
  if (total === 0) return { rate: 100, completed: 0, total: 0 };

  const completed = await RevisionSchedule.count({
    where: { user_id: userId, mastered: true },
  });

  return {
    rate: parseFloat(((completed / total) * 100).toFixed(1)),
    completed,
    total,
  };
}

module.exports = { getTodayRevisionTasks, calculateSM2, processRevisionRating, getRevisionCompletionRate };
