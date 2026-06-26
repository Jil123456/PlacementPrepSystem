const { User, UserProgress, RoadmapDay, Task, RevisionSchedule } = require('../models');
const { daysBetween, todayMidnight } = require('../utils/helpers');

async function canUnlockNextDay(userId) {
  const user = await User.findByPk(userId);
  if (!user) return { canUnlock: false, reason: 'User not found' };

  if (user.current_day >= 60) {
    return { canUnlock: false, reason: 'You have completed all 60 days!' };
  }

  const currentDayRoadmap = await RoadmapDay.findOne({
    where: { day_number: user.current_day },
  });

  if (!currentDayRoadmap) {
    return { canUnlock: false, reason: 'Current roadmap day not found' };
  }

  const progress = await UserProgress.findOne({
    where: { user_id: userId, roadmap_day_id: currentDayRoadmap.id },
  });

  if (!progress || !progress.is_completed) {
    return {
      canUnlock: false,
      reason: 'Complete all tasks for the current day first',
      tasks_completed: progress ? progress.tasks_completed : 0,
      total_tasks: progress ? progress.total_tasks : 0,
    };
  }

  return { canUnlock: true, next_day: user.current_day + 1 };
}

async function updateStreak(user) {
  const today = todayMidnight();
  const lastActive = user.last_active_date ? new Date(user.last_active_date) : null;

  if (!lastActive) {
    user.streak = 1;
    user.max_streak = Math.max(user.max_streak, 1);
    user.last_active_date = today;
    await user.save();
    return user.streak;
  }

  lastActive.setHours(0, 0, 0, 0);
  const diff = daysBetween(lastActive, today);

  if (diff === 0) {
    return user.streak;
  } else if (diff === 1) {
    user.streak += 1;
    user.max_streak = Math.max(user.max_streak, user.streak);
  } else {
    user.streak = 1;
  }

  user.last_active_date = today;
  await user.save();
  return user.streak;
}

async function generateRevisionEntries(userId, dayNumber) {
  // Spaced Repetition (Bug 8) handles this dynamically upon task completion.
  return [];
}

module.exports = { canUnlockNextDay, updateStreak, generateRevisionEntries };
