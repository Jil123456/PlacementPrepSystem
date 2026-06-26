const { UserLevel } = require('../models');
const config = require('../config/config');

async function addXP(userId, event, multiplier = 1) {
  const rewards = config.xpRewards;
  let xpGain = 0;

  switch (event) {
    case 'task_complete':
      xpGain = rewards.task_complete;
      break;
    case 'correct_answer':
      xpGain = rewards.correct_answer;
      break;
    case 'streak_day':
      xpGain = rewards.streak_day * multiplier;
      break;
    case 'mock_test':
      xpGain = rewards.mock_test;
      break;
    case 'perfect_day':
      xpGain = rewards.perfect_day;
      break;
    default:
      xpGain = 0;
  }

  if (xpGain === 0) return null;

  const userLevel = await UserLevel.findOne({ where: { user_id: userId } });
  if (!userLevel) return null;

  userLevel.xp_points += xpGain;
  await userLevel.save();

  await checkLevelUp(userId);

  return { xpGain, totalXP: userLevel.xp_points };
}

async function checkLevelUp(userId) {
  const userLevel = await UserLevel.findOne({ where: { user_id: userId } });
  if (!userLevel) return null;

  const thresholds = config.levelThresholds;
  let newLevel = 'beginner';

  if (userLevel.xp_points >= thresholds.advanced.min) {
    newLevel = 'advanced';
  } else if (userLevel.xp_points >= thresholds.intermediate.min) {
    newLevel = 'intermediate';
  }

  if (newLevel !== userLevel.level) {
    userLevel.level = newLevel;
    userLevel.level_up_at = new Date();
    await userLevel.save();
    return { leveled_up: true, new_level: newLevel, xp: userLevel.xp_points };
  }

  return { leveled_up: false, level: userLevel.level, xp: userLevel.xp_points };
}

module.exports = { addXP, checkLevelUp };
