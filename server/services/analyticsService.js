const { Op } = require('sequelize');
const { User, UserAnswer, TestResult, UserProgress, RevisionSchedule, Question, UserLevel } = require('../models');
const config = require('../config/config');
const { daysBetween, todayMidnight } = require('../utils/helpers');

async function calculateReadiness(userId) {
  const weights = config.readinessWeights;

  const totalAnswers = await UserAnswer.count({ where: { user_id: userId } });
  const correctAnswers = await UserAnswer.count({ where: { user_id: userId, is_correct: true } });
  const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

  const testResults = await TestResult.findAll({
    where: { user_id: userId },
    order: [['taken_at', 'DESC']],
    limit: 5,
  });
  let mockScore = 0;
  if (testResults.length > 0) {
    const avgMock = testResults.reduce((sum, t) => {
      return sum + (t.total_questions > 0 ? (t.correct_answers / t.total_questions) * 100 : 0);
    }, 0) / testResults.length;
    mockScore = avgMock;
  }

  const user = await User.findByPk(userId);
  const streakScore = Math.min((user.streak / 30) * 100, 100);

  const totalRevisions = await RevisionSchedule.count({ where: { user_id: userId } });
  const completedRevisions = await RevisionSchedule.count({ where: { user_id: userId, is_completed: true } });
  const revisionScore = totalRevisions > 0 ? (completedRevisions / totalRevisions) * 100 : 100;

  const readiness = (
    weights.accuracy * accuracy +
    weights.mockTest * mockScore +
    weights.streak * streakScore +
    weights.revision * revisionScore
  );

  return {
    readiness_score: parseFloat(readiness.toFixed(1)),
    components: {
      accuracy: parseFloat(accuracy.toFixed(1)),
      mock_test: parseFloat(mockScore.toFixed(1)),
      streak: parseFloat(streakScore.toFixed(1)),
      revision: parseFloat(revisionScore.toFixed(1)),
    },
    total_answers: totalAnswers,
    correct_answers: correctAnswers,
    mock_tests_taken: testResults.length,
    current_streak: user.streak,
  };
}

async function getWeeklyStats(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const answers = await UserAnswer.findAll({
    where: {
      user_id: userId,
      answered_at: { [Op.gte]: sevenDaysAgo },
    },
  });

  const totalAnswered = answers.length;
  const correctCount = answers.filter((a) => a.is_correct).length;
  const totalTime = answers.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0);

  const daysCompleted = await UserProgress.count({
    where: {
      user_id: userId,
      is_completed: true,
      completed_at: { [Op.gte]: sevenDaysAgo },
    },
  });

  const testsThisWeek = await TestResult.count({
    where: {
      user_id: userId,
      taken_at: { [Op.gte]: sevenDaysAgo },
    },
  });

  return {
    period: '7 days',
    total_questions_answered: totalAnswered,
    correct_answers: correctCount,
    accuracy: totalAnswered > 0 ? parseFloat(((correctCount / totalAnswered) * 100).toFixed(1)) : 0,
    total_time_seconds: totalTime,
    days_completed: daysCompleted,
    mock_tests_taken: testsThisWeek,
  };
}

async function getAccuracyTrend(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const answers = await UserAnswer.findAll({
    where: {
      user_id: userId,
      answered_at: { [Op.gte]: thirtyDaysAgo },
    },
    order: [['answered_at', 'ASC']],
  });

  const dailyMap = {};
  for (const ans of answers) {
    const dateKey = new Date(ans.answered_at).toISOString().split('T')[0];
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { total: 0, correct: 0 };
    }
    dailyMap[dateKey].total += 1;
    if (ans.is_correct) dailyMap[dateKey].correct += 1;
  }

  const trend = Object.entries(dailyMap).map(([date, data]) => ({
    date,
    total: data.total,
    correct: data.correct,
    accuracy: parseFloat(((data.correct / data.total) * 100).toFixed(1)),
  }));

  return trend;
}

async function getTopicPerformance(userId) {
  const answers = await UserAnswer.findAll({
    where: { user_id: userId },
    include: [{
      model: Question,
      as: 'question',
      attributes: ['category', 'subcategory'],
    }],
  });

  const topicMap = {};
  for (const ans of answers) {
    if (!ans.question) continue;
    const key = `${ans.question.category}:${ans.question.subcategory || 'general'}`;
    if (!topicMap[key]) {
      topicMap[key] = {
        category: ans.question.category,
        subcategory: ans.question.subcategory || 'general',
        total: 0,
        correct: 0,
      };
    }
    topicMap[key].total += 1;
    if (ans.is_correct) topicMap[key].correct += 1;
  }

  return Object.values(topicMap).map((t) => ({
    ...t,
    accuracy: parseFloat(((t.correct / t.total) * 100).toFixed(1)),
  })).sort((a, b) => b.accuracy - a.accuracy);
}

async function detectDropoff(userId) {
  const user = await User.findByPk(userId);
  if (!user) return { is_dropping_off: false };

  const today = todayMidnight();
  const lastActive = user.last_active_date ? new Date(user.last_active_date) : null;

  if (!lastActive) {
    return {
      is_dropping_off: true,
      days_inactive: null,
      severity: 'new_user',
      recovery_plan: [
        'Start with Day 1 tasks to build momentum',
        'Set a daily reminder for 30 minutes of practice',
        'Focus on easy questions first to build confidence',
      ],
    };
  }

  const daysInactive = daysBetween(lastActive, today);

  if (daysInactive <= 1) {
    return { is_dropping_off: false, days_inactive: daysInactive };
  }

  let severity = 'mild';
  let recoveryPlan = [];

  if (daysInactive >= 7) {
    severity = 'critical';
    recoveryPlan = [
      'Review your weak topics before continuing',
      `Resume from Day ${user.current_day} with revision of recent days`,
      'Take a diagnostic mock test to assess current level',
      'Set smaller daily goals (2-3 tasks) to rebuild habit',
      'Complete all pending revisions',
    ];
  } else if (daysInactive >= 3) {
    severity = 'moderate';
    recoveryPlan = [
      `Continue from Day ${user.current_day}`,
      'Complete pending revision tasks first',
      'Do a quick 10-question practice to warm up',
      'Set daily reminders',
    ];
  } else {
    recoveryPlan = [
      `Jump right back into Day ${user.current_day}`,
      'Your streak was reset but you can rebuild it quickly',
    ];
  }

  return {
    is_dropping_off: daysInactive > 1,
    days_inactive: daysInactive,
    severity,
    recovery_plan: recoveryPlan,
    last_active: user.last_active_date,
    current_day: user.current_day,
    streak_before: user.streak,
  };
}

module.exports = {
  calculateReadiness,
  getWeeklyStats,
  getAccuracyTrend,
  getTopicPerformance,
  detectDropoff,
};
