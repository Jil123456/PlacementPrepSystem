const { UserLevel, User } = require('../models');
const config = require('../config/config');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getMyLevel(req, res, next) {
  try {
    const userId = req.user.id;

    const userLevel = await UserLevel.findOne({ where: { user_id: userId } });

    if (!userLevel) {
      return res.status(404).json(errorResponse('Level data not found'));
    }

    const thresholds = config.levelThresholds;
    let nextLevelXP = 0;
    let currentLevelMin = 0;

    if (userLevel.level === 'beginner') {
      currentLevelMin = thresholds.beginner.min;
      nextLevelXP = thresholds.intermediate.min;
    } else if (userLevel.level === 'intermediate') {
      currentLevelMin = thresholds.intermediate.min;
      nextLevelXP = thresholds.advanced.min;
    } else {
      currentLevelMin = thresholds.advanced.min;
      nextLevelXP = null;
    }

    const progressToNext = nextLevelXP
      ? parseFloat((((userLevel.xp_points - currentLevelMin) / (nextLevelXP - currentLevelMin)) * 100).toFixed(1))
      : 100;

    return res.json(successResponse({
      level: userLevel.level,
      xp_points: userLevel.xp_points,
      tasks_completed_total: userLevel.tasks_completed_total,
      correct_streak: userLevel.correct_streak,
      level_up_at: userLevel.level_up_at,
      next_level_xp: nextLevelXP,
      progress_to_next_level: Math.max(0, Math.min(100, progressToNext)),
    }));
  } catch (error) {
    next(error);
  }
}

async function getLeaderboard(req, res, next) {
  try {
    const topUsers = await UserLevel.findAll({
      order: [['xp_points', 'DESC']],
      limit: 10,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'streak', 'max_streak', 'current_day'],
      }],
    });

    const leaderboard = topUsers.map((entry, index) => ({
      rank: index + 1,
      user: entry.user ? {
        id: entry.user.id,
        name: entry.user.name,
        current_day: entry.user.current_day,
        streak: entry.user.streak,
      } : null,
      level: entry.level,
      xp_points: entry.xp_points,
      tasks_completed: entry.tasks_completed_total,
    }));

    return res.json(successResponse({ leaderboard }));
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyLevel, getLeaderboard };
