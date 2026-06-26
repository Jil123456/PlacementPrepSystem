const { UserProgress, TestResult, UserAnswer } = require('../models');
const sequelize = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getReadiness(req, res, next) {
  try {
    // Dummy Readiness Formula
    return res.json(successResponse({ score: 68 }));
  } catch (error) {
    next(error);
  }
}

async function getWeeklyReport(req, res, next) {
  return res.json(successResponse({ tasksCompleted: 15, accuracy: 72 }));
}

async function getAccuracyTrend(req, res, next) {
  return res.json(successResponse([{day: 1, acc: 60}, {day: 2, acc: 65}]));
}

async function getTopicPerformance(req, res, next) {
  return res.json(successResponse({ arrays: 80, strings: 60, dp: 40 }));
}

async function getDropoffAlert(req, res, next) {
  return res.json(successResponse({ alert: false }));
}

async function getHeatmapData(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Group answers by date (using cast to date)
    const answers = await UserAnswer.findAll({
      where: { user_id: userId },
      attributes: [
        [sequelize.fn('date', sequelize.col('answered_at')), 'date'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('date', sequelize.col('answered_at'))],
      raw: true
    });
    
    // Format to what react-activity-calendar expects
    // Output should be like: [{ date: '2023-01-01', count: 5, level: 2 }]
    const data = answers.map(item => {
      const count = parseInt(item.count, 10);
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5 && count <= 10) level = 3;
      else if (count > 10) level = 4;
      
      // Sequelize date might return a Date object or string depending on dialect,
      // so we convert to YYYY-MM-DD
      const dateObj = new Date(item.date);
      const formattedDate = dateObj.toISOString().split('T')[0];
      
      return {
        date: formattedDate,
        count: count,
        level: level
      };
    });

    return res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReadiness,
  getWeeklyReport,
  getAccuracyTrend,
  getTopicPerformance,
  getDropoffAlert,
  getHeatmapData
};
