const { Op } = require('sequelize');
const { User, RoadmapDay, Task, Question, UserProgress, UserAnswer, Mistake, RevisionSchedule } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');
const levelService = require('../services/levelService');
const aiEvaluator = require('../services/aiEvaluator');
const weaknessService = require('../services/weaknessService');
const roadmapService = require('../services/roadmapService');
const sequelize = require('../config/database');

async function generateTasksForDay(userId, dayNumber, roadmapDayId) {
  const tasksToCreate = [];
  let orderIndex = 1;

  // Find questions the user has answered in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const answered = await UserAnswer.findAll({ 
    where: { 
      user_id: userId,
      answered_at: { [Op.gte]: sevenDaysAgo }
    }, 
    attributes: ['question_id'] 
  });
  const answeredQuestionIds = answered.map(a => a.question_id).filter(id => id != null);

  const recentRoadmapDays = await RoadmapDay.findAll({
    where: {
      user_id: userId,
      day_number: { [Op.gte]: dayNumber > 7 ? dayNumber - 7 : 1 }
    },
    attributes: ['id']
  });
  const recentRoadmapDayIds = recentRoadmapDays.map(r => r.id);

  const existingTasks = await Task.findAll({
    attributes: ['question_id'],
    where: { 
      question_id: { [Op.ne]: null },
      roadmap_day_id: { [Op.in]: recentRoadmapDayIds }
    }
  });
  const assignedQuestionIds = existingTasks.map(t => t.question_id).filter(id => id != null);
  const excludeIds = [...new Set([...answeredQuestionIds, ...assignedQuestionIds])];

  const fetchQuestions = async (category, limit, difficulty = null) => {
    let whereClause = { category: category };
    if (excludeIds.length > 0) {
      whereClause.id = { [Op.notIn]: excludeIds };
    }
    if (difficulty) whereClause.difficulty = difficulty;
    
    let qs = await Question.findAll({
      where: whereClause,
      limit: limit,
      order: sequelize.random()
    });

    // If we couldn't find enough questions, fetch without exclusion
    if (qs.length < limit) {
      const fallbackWhere = { category: category };
      if (difficulty) fallbackWhere.difficulty = difficulty;
      const fallbackQs = await Question.findAll({
        where: fallbackWhere,
        limit: limit - qs.length,
        order: sequelize.random()
      });
      qs = [...qs, ...fallbackQs];
    }
    
    return qs;
  };

  if (dayNumber % 7 === 0) {
    // SUNDAY: TEST DAY
    tasksToCreate.push({
      roadmap_day_id: roadmapDayId,
      type: 'mock_test',
      title: 'Sunday Mock Test',
      description: 'Take a 45-minute mock test (DSA).',
      question_id: null,
      order_index: orderIndex++,
      is_required: true,
    });

  } else if (dayNumber % 7 === 6) {
    // SATURDAY: REVISION DAY
    const revSchedule = await RevisionSchedule.findAll({
      where: {
        user_id: userId,
        next_revision_date: { [Op.lte]: new Date() },
        is_completed: false
      },
      include: [{ model: Question, as: 'question', where: { category: 'dsa' } }],
      order: [['next_revision_date', 'ASC']],
      limit: 12
    });

    for (const rev of revSchedule) {
      tasksToCreate.push({
        roadmap_day_id: roadmapDayId,
        type: 'dsa_revision',
        title: `Revise: ${rev.question.title}`,
        description: 'Solve without looking at code (Pattern Recognition).',
        question_id: rev.question_id,
        order_index: orderIndex++,
        is_required: true,
      });
    }

  } else {
    // MONDAY-FRIDAY: STANDARD DAY

    // Step 1: REVISION (Highest Priority)
    const revSchedule = await RevisionSchedule.findAll({
      where: {
        user_id: userId,
        next_revision_date: { [Op.lte]: new Date() },
        is_completed: false
      },
      include: [{ model: Question, as: 'question', where: { category: 'dsa' } }],
      order: [['next_revision_date', 'ASC']],
      limit: 3
    });

    for (const rev of revSchedule) {
      tasksToCreate.push({
        roadmap_day_id: roadmapDayId,
        type: 'dsa_revision',
        title: `Revise: ${rev.question.title}`,
        description: 'Spaced Repetition Review. Solve without looking at code.',
        question_id: rev.question_id,
        order_index: orderIndex++,
        is_required: true,
      });
    }

    // Step 2: NEW DSA (1 Easy, 1 Medium)
    const dsaEasy = await fetchQuestions('dsa', 1, 'easy');
    const dsaMedium = await fetchQuestions('dsa', 1, 'medium');
    const newDsaQs = [...dsaEasy, ...dsaMedium];

    for (const q of newDsaQs) {
      tasksToCreate.push({
        roadmap_day_id: roadmapDayId,
        type: 'dsa',
        title: `New DSA: ${q.title}`,
        description: 'Try for 20-30 min. Write Approach & Pattern.',
        question_id: q.id,
        order_index: orderIndex++,
        is_required: true,
      });
    }

    // Step 4: Core Subject (1 question)
    const coreQs = await fetchQuestions('core_subject', 1);
    for (const q of coreQs) {
      tasksToCreate.push({
        roadmap_day_id: roadmapDayId,
        type: 'core_subject',
        title: `Core Subject: ${q.title}`,
        description: 'Understand deeply. Don\'t rush.',
        question_id: q.id,
        order_index: orderIndex++,
        is_required: true,
      });
    }

    // Step 5: HR (1 question)
    const hrQs = await fetchQuestions('hr', 1);
    for (const q of hrQs) {
      tasksToCreate.push({
        roadmap_day_id: roadmapDayId,
        type: 'hr',
        title: `HR: ${q.title}`,
        description: 'Speak it out loud. AI will evaluate your answer.',
        question_id: q.id,
        order_index: orderIndex++,
        is_required: true,
      });
    }
  }

  // --- FEATURE 5: WEAKNESS DETECTION & AUTO ROADMAP UPDATE ---
  try {
    const weaknessData = await weaknessService.detectWeakness(userId);
    if (weaknessData && weaknessData.weak_topics && weaknessData.weak_topics.length > 0) {
      // Pick the most critical weak topic
      const worstTopic = weaknessData.weak_topics[0];
      
      // Fetch 1 extra question for this specific topic
      let weakQs = await Question.findAll({
        where: { category: worstTopic.category, subcategory: worstTopic.subcategory },
        limit: 1,
        order: sequelize.random()
      });

      // Filter out already answered if possible (or just use raw)
      if (excludeIds.length > 0) {
        const filteredWeakQs = await Question.findAll({
          where: { category: worstTopic.category, subcategory: worstTopic.subcategory, id: { [Op.notIn]: excludeIds } },
          limit: 1,
          order: sequelize.random()
        });
        if (filteredWeakQs.length > 0) weakQs = filteredWeakQs;
      }

      for (const q of weakQs) {
        tasksToCreate.push({
          roadmap_day_id: roadmapDayId,
          type: worstTopic.category, // e.g., 'dsa' or 'aptitude'
          title: `Weak Area Focus: ${q.subcategory}`,
          description: `Extra practice based on your <50% accuracy in ${q.subcategory}.`,
          question_id: q.id,
          order_index: orderIndex++,
          is_required: true,
        });
      }
    }
  } catch (err) {
    console.error('Failed to inject weakness task:', err);
  }

  if (tasksToCreate.length > 0) {
    await Task.bulkCreate(tasksToCreate);
  }
}

async function getTasksForDayLogic(user, dayNumber) {
  let roadmapDay = await RoadmapDay.findOne({ where: { day_number: dayNumber, user_id: user.id } });
  
  if (!roadmapDay) {
    roadmapDay = await RoadmapDay.create({
      day_number: dayNumber,
      user_id: user.id,
      title: dayNumber % 5 === 0 ? `Revision Day ${dayNumber}` : `Day ${dayNumber} Challenge`,
      description: dayNumber % 5 === 0 ? 'Revise your past 4 days of learning.' : 'Complete your mandatory daily tasks.'
    });
  }

  let tasks = await Task.findAll({
    where: { roadmap_day_id: roadmapDay.id },
    include: [{
      model: Question,
      as: 'question',
      attributes: { exclude: ['correct_answer', 'explanation'] },
    }],
    order: [['order_index', 'ASC']],
  });

  if (tasks.length === 0 && dayNumber <= user.current_day) {
    await generateTasksForDay(user.id, dayNumber, roadmapDay.id);
    tasks = await Task.findAll({
      where: { roadmap_day_id: roadmapDay.id },
      include: [{
        model: Question,
        as: 'question',
        attributes: { exclude: ['correct_answer', 'explanation'] },
      }],
      order: [['order_index', 'ASC']],
    });
  }

  const completedAnswers = await UserAnswer.findAll({
    where: {
      user_id: user.id,
      task_id: { [Op.in]: tasks.map((t) => t.id) },
    },
  });

  const completedTaskIds = new Set(completedAnswers.map((a) => a.task_id));

  const tasksWithStatus = tasks.map((task) => ({
    ...task.toJSON(),
    is_completed: completedTaskIds.has(task.id),
  }));

  let progress = await UserProgress.findOne({
    where: { user_id: user.id, roadmap_day_id: roadmapDay.id },
  });

  if (!progress && tasks.length > 0) {
    progress = await UserProgress.create({
      user_id: user.id,
      roadmap_day_id: roadmapDay.id,
      total_tasks: tasks.length,
      started_at: new Date(),
    });
  }

  return {
    day: roadmapDay,
    tasks: tasksWithStatus,
    progress,
  };
}

async function getTodayTasks(req, res, next) {
  try {
    const data = await getTasksForDayLogic(req.user, req.user.current_day);
    return res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

async function getDayTasks(req, res, next) {
  try {
    const { dayNumber } = req.params;
    const user = req.user;
    const day = parseInt(dayNumber, 10);

    if (isNaN(day) || day < 1) {
      return res.status(400).json(errorResponse('Invalid day number'));
    }

    if (day > user.current_day) {
      return res.status(403).json(errorResponse(`Day ${day} is locked. Complete previous days first.`));
    }

    const data = await getTasksForDayLogic(user, day);
    return res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
}

async function completeTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const { answer, time_taken_seconds } = req.body;
    const user = req.user;

    const task = await Task.findByPk(taskId, {
      include: [
        { model: Question, as: 'question' },
        { model: RoadmapDay, as: 'roadmapDay' },
      ],
    });

    if (!task) return res.status(404).json(errorResponse('Task not found'));

    if (task.roadmapDay.day_number > user.current_day) {
      return res.status(403).json(errorResponse('This task belongs to a locked day'));
    }

    const existingAnswer = await UserAnswer.findOne({
      where: { user_id: user.id, task_id: task.id },
    });

    if (existingAnswer) return res.status(409).json(errorResponse('Task already completed'));

    let isCorrect = true;
    let feedback = "";
    let correctAns = task.question ? task.question.correct_answer : null;
    let explanation = task.question ? task.question.explanation : null;

    if (task.question) {
      // Determine if it's an MCQ (has valid JSON options array/object)
      let isMCQ = false;
      try {
        if (task.question.options) {
          const parsed = typeof task.question.options === 'string' ? JSON.parse(task.question.options) : task.question.options;
          if (parsed && (Array.isArray(parsed) || Object.keys(parsed).length > 0)) {
            isMCQ = true;
          }
        }
      } catch (e) {}

      if (isMCQ) {
        // Direct matching for Multiple Choice
        isCorrect = String(answer).trim().toLowerCase() === String(task.question.correct_answer).trim().toLowerCase();
        feedback = isCorrect ? "Correct!" : `Incorrect. The correct answer was ${task.question.correct_answer}.`;
      } else if (task.type === 'hr' || task.type === 'aptitude') {
        // AI Evaluation for Subjective Answers
        const evalResult = await aiEvaluator.evaluateAnswer(
          task.question.title,
          answer || "(No Answer)",
          task.type,
          task.question.correct_answer
        );
        isCorrect = evalResult.isCorrect;
        feedback = evalResult.feedback;
        correctAns = evalResult.idealAnswer;
        explanation = evalResult.explanation || feedback;
      } else {
        // Simple string match for DSA / Concepts if they aren't MCQ
        if (answer && task.question.correct_answer !== 'completed') {
            isCorrect = String(answer).trim().toLowerCase() === String(task.question.correct_answer).trim().toLowerCase();
        }
      }
    }

    const userAnswer = await UserAnswer.create({
      user_id: user.id,
      question_id: task.question_id,
      task_id: task.id,
      user_answer: answer || "completed",
      is_correct: isCorrect,
      time_taken_seconds: time_taken_seconds || null,
      answered_at: new Date(),
    });

    if (!isCorrect && task.question) {
      await Mistake.create({
        user_id: user.id,
        question_id: task.question_id,
        user_answer: answer || "(Empty)",
        correct_answer: correctAns || "(Not provided)",
        category: task.type,
      });
    }

    // --- SPACED REPETITION LOGIC (Day 1, 3, 7, 14, 30) ---
    if (!isCorrect && task.question) {
      // Question solved incorrectly. Schedule all 5 revision dates.
      const intervals = [1, 3, 7, 14, 30];
      const revisionEntries = intervals.map((days, index) => {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        return {
          user_id: user.id,
          question_id: task.question_id,
          next_revision_date: nextDate,
          revision_stage: index + 1
        };
      });
      await RevisionSchedule.bulkCreate(revisionEntries);
    } else if (task.type === 'dsa_revision' && isCorrect) {
      const rev = await RevisionSchedule.findOne({
        where: { user_id: user.id, question_id: task.question_id, is_completed: false }
      });
      if (rev) {
        rev.is_completed = true;
        rev.completed_at = new Date();
        await rev.save();

        const nextDate = new Date();
        if (!isCorrect) {
          // Reset to Day 1 (tomorrow) if they got it wrong again
          nextDate.setDate(nextDate.getDate() + 1);
          await RevisionSchedule.create({
            user_id: user.id,
            question_id: task.question_id,
            next_revision_date: nextDate,
            revision_stage: 1
          });
        } else {
          // Schedule next stage
          let nextStage = rev.revision_stage + 1;
          if (nextStage === 2) nextDate.setDate(nextDate.getDate() + 3); // Stage 2: 3 days
          else if (nextStage === 3) nextDate.setDate(nextDate.getDate() + 7); // Stage 3: 7 days
          else if (nextStage === 4) nextDate.setDate(nextDate.getDate() + 14); // Stage 4: 14 days
          else if (nextStage === 5) nextDate.setDate(nextDate.getDate() + 30); // Stage 5: 30 days
          
          if (nextStage <= 5) {
            await RevisionSchedule.create({
              user_id: user.id,
              question_id: task.question_id,
              next_revision_date: nextDate,
              revision_stage: nextStage
            });
          }
        }
      }
    }

    let progress = await UserProgress.findOne({
      where: { user_id: user.id, roadmap_day_id: task.roadmap_day_id },
    });

    const totalTasks = await Task.count({ where: { roadmap_day_id: task.roadmap_day_id } });

    if (progress) {
      progress.tasks_completed += 1;
      
      if (task.type === 'dsa' || task.type === 'dsa_revision') {
        progress.dsa_completed += 1;
      } else if (task.type === 'aptitude') {
        progress.aptitude_completed += 1;
      } else if (task.type === 'core_subject') {
        progress.core_subject_completed += 1;
      } else if (task.type === 'hr') {
        progress.hr_completed += 1;
      }

      progress.total_tasks = totalTasks;

      if (progress.tasks_completed >= totalTasks) {
        progress.is_completed = true;
        progress.completed_at = new Date();
        
        // AUTO-ADVANCE USER TO NEXT DAY!
        if (task.roadmapDay.day_number === user.current_day) {
            user.current_day += 1;
            await user.save();
        }
      }

      await progress.save();
    }

    await levelService.addXP(user.id, 'task_complete');
    if (isCorrect) await levelService.addXP(user.id, 'correct_answer');
    
    await roadmapService.updateStreak(user);

    return res.json(successResponse({
      is_correct: isCorrect,
      explanation: explanation,
      correct_answer: correctAns,
      feedback: feedback,
      progress: progress ? {
        tasks_completed: progress.tasks_completed,
        total_tasks: progress.total_tasks,
        is_day_complete: progress.is_completed,
        dsa_completed: progress.dsa_completed,
        aptitude_completed: progress.aptitude_completed,
        core_subject_completed: progress.core_subject_completed,
        hr_completed: progress.hr_completed,
      } : null,
    }, isCorrect ? 'Task Completed Successfully!' : 'Task Recorded (Incorrect/Needs Improvement)'));
  } catch (error) {
    next(error);
  }
}

async function getLeetcodeContent(req, res, next) {
  try {
    const { titleSlug } = req.params;
    const query = `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }`;
    const variables = { titleSlug };
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const json = await lcRes.json();
    if (json.data && json.data.question && json.data.question.content) {
      return res.json(successResponse({ content: json.data.question.content }));
    }
    return res.status(404).json(errorResponse('Leetcode question not found'));
  } catch (error) {
    next(error);
  }
}

async function getTaskDetails(req, res, next) {
  try {
    const { taskId } = req.params;
    const user = req.user;

    const task = await Task.findByPk(taskId, {
      include: [
        { model: Question, as: 'question' },
        { model: RoadmapDay, as: 'roadmapDay' },
      ],
    });

    if (!task) return res.status(404).json(errorResponse('Task not found'));

    if (task.roadmapDay.day_number > user.current_day) {
      return res.status(403).json(errorResponse('This task belongs to a locked day'));
    }

    const existingAnswer = await UserAnswer.findOne({
      where: { user_id: user.id, task_id: task.id },
    });

    const taskWithStatus = {
      ...task.toJSON(),
      is_completed: !!existingAnswer,
    };

    return res.json(successResponse({ task: taskWithStatus }));
  } catch (error) {
    next(error);
  }
}

async function replaceTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const user = req.user;

    const task = await Task.findByPk(taskId, {
      include: [{ model: Question, as: 'question' }]
    });

    if (!task || !task.question) return res.status(404).json(errorResponse('Task or question not found'));

    // Find a new question of the same category, subcategory, and difficulty
    const newQuestion = await Question.findOne({
      where: {
        category: task.question.category,
        subcategory: task.question.subcategory,
        difficulty: task.question.difficulty,
        id: { [Op.ne]: task.question_id } // Exclude the current one
      },
      order: sequelize.random()
    });

    if (!newQuestion) {
      return res.status(400).json(errorResponse('No alternative questions available for this topic.'));
    }

    // Update the task with the new question
    let newTitle = task.title;
    if (task.title.includes(':')) {
      const prefix = task.title.split(':')[0];
      newTitle = `${prefix}: ${newQuestion.title}`;
    } else {
      newTitle = newQuestion.title;
    }

    task.question_id = newQuestion.id;
    task.title = newTitle;
    await task.save();

    // Re-fetch with includes
    const updatedTask = await Task.findByPk(taskId, {
      include: [
        { model: Question, as: 'question' },
        { model: RoadmapDay, as: 'roadmapDay' }
      ]
    });

    return res.json(successResponse({ task: updatedTask }));
  } catch (error) {
    next(error);
  }
}

module.exports = { getTodayTasks, getDayTasks, completeTask, getLeetcodeContent, getTaskDetails, replaceTask };
