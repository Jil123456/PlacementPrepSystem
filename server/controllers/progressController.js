const { Op } = require('sequelize');
const { User, RoadmapDay, UserProgress, UserLevel, UserAnswer, RevisionSchedule } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');
const roadmapService = require('../services/roadmapService');
const weaknessService = require('../services/weaknessService');
const revisionService = require('../services/revisionService');
const levelService = require('../services/levelService');
const analyticsService = require('../services/analyticsService');

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: UserLevel, as: 'level' }],
    });

    const userProgressList = await UserProgress.findAll({
      where: { user_id: userId }
    });
    
    const totalCompleted = userProgressList.filter(p => p.is_completed).length;
    const progressPercent = parseFloat(((totalCompleted / 60) * 100).toFixed(1));

    let dsaTotal = 0, aptitudeTotal = 0, coreTotal = 0, hrTotal = 0;
    userProgressList.forEach(p => {
      dsaTotal += p.dsa_completed || 0;
      aptitudeTotal += p.aptitude_completed || 0;
      coreTotal += p.core_subject_completed || 0;
      hrTotal += p.hr_completed || 0;
    });

    const { weak_topics } = await weaknessService.detectWeakness(userId);

    const readinessData = await analyticsService.calculateReadiness(userId);

    const { revisions, roadmapDays } = await revisionService.getTodayRevisionTasks(userId, user.current_day);

    return res.json(successResponse({
      user: {
        name: user.name,
        current_day: user.current_day,
        streak: user.streak,
        max_streak: user.max_streak,
      },
      level: user.level,
      progress: {
        days_completed: totalCompleted,
        total_days: 60,
        percentage: progressPercent,
        categories: {
          dsa: dsaTotal,
          aptitude: aptitudeTotal,
          core_subject: coreTotal,
          hr: hrTotal
        }
      },
      weak_areas: weak_topics.slice(0, 5),
      readiness: readinessData,
      today_revision: {
        count: revisions.length,
        days_to_review: roadmapDays.map((d) => ({
          day_number: d.day_number,
          title: d.title,
        })),
      },
    }));
  } catch (error) {
    next(error);
  }
}

async function getRoadmap(req, res, next) {
  try {
    const userId = req.user.id;
    const user = req.user;

    const roadmapDays = await RoadmapDay.findAll({
      where: { user_id: userId },
      order: [['day_number', 'ASC']],
    });

    const userProgressList = await UserProgress.findAll({
      where: { user_id: userId },
    });

    const progressMap = {};
    for (const p of userProgressList) {
      progressMap[p.roadmap_day_id] = p;
    }

    const roadmap = roadmapDays.map((day) => {
      const progress = progressMap[day.id];
      return {
        ...day.toJSON(),
        is_locked: day.day_number > user.current_day,
        is_current: day.day_number === user.current_day,
        is_completed: progress ? progress.is_completed : false,
        tasks_completed: progress ? progress.tasks_completed : 0,
        total_tasks: progress ? progress.total_tasks : 0,
      };
    });

    return res.json(successResponse({ roadmap, current_day: user.current_day }));
  } catch (error) {
    next(error);
  }
}

async function getWeakness(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await weaknessService.detectWeakness(userId);
    return res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

async function unlockNextDay(req, res, next) {
  try {
    const userId = req.user.id;
    const checkResult = await roadmapService.canUnlockNextDay(userId);

    if (!checkResult.canUnlock) {
      return res.status(400).json(errorResponse(checkResult.reason, {
        tasks_completed: checkResult.tasks_completed,
        total_tasks: checkResult.total_tasks,
      }));
    }

    const user = await User.findByPk(userId);

    const streak = await roadmapService.updateStreak(user);
    await levelService.addXP(userId, 'streak_day', streak);

    const totalTasksToday = await UserAnswer.count({
      where: { user_id: userId },
      include: [{
        association: 'task',
        where: {
          roadmap_day_id: (await RoadmapDay.findOne({ where: { day_number: user.current_day } })).id,
        },
      }],
    });

    const correctToday = await UserAnswer.count({
      where: { user_id: userId, is_correct: true },
      include: [{
        association: 'task',
        where: {
          roadmap_day_id: (await RoadmapDay.findOne({ where: { day_number: user.current_day } })).id,
        },
      }],
    });

    if (totalTasksToday > 0 && correctToday === totalTasksToday) {
      await levelService.addXP(userId, 'perfect_day');
    }

    await roadmapService.generateRevisionEntries(userId, user.current_day);

    user.current_day = Math.min(user.current_day + 1, 60);
    await user.save();

    return res.json(successResponse({
      current_day: user.current_day,
      streak: user.streak,
      message: `Day ${user.current_day} unlocked!`,
    }, 'Next day unlocked successfully'));
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard, getRoadmap, getWeakness, unlockNextDay };
