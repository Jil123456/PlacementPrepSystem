const sequelize = require('../config/database');
const User = require('./User');
const RoadmapDay = require('./RoadmapDay');
const Task = require('./Task');
const Question = require('./Question');
const UserProgress = require('./UserProgress');
const UserAnswer = require('./UserAnswer');
const TestResult = require('./TestResult');
const Mistake = require('./Mistake');
const RevisionSchedule = require('./RevisionSchedule');
const UserLevel = require('./UserLevel');
const CompanyMode = require('./CompanyMode');
const JobApplication = require('./JobApplication');

// ── User Associations ──
User.hasMany(UserProgress, { foreignKey: 'user_id', as: 'progress' });
User.hasMany(UserAnswer, { foreignKey: 'user_id', as: 'answers' });
User.hasMany(TestResult, { foreignKey: 'user_id', as: 'testResults' });
User.hasMany(Mistake, { foreignKey: 'user_id', as: 'mistakes' });
User.hasMany(RevisionSchedule, { foreignKey: 'user_id', as: 'revisionSchedules' });
User.hasOne(UserLevel, { foreignKey: 'user_id', as: 'level' });
User.hasMany(RoadmapDay, { foreignKey: 'user_id', as: 'roadmapDays' });
User.hasMany(JobApplication, { foreignKey: 'user_id', as: 'jobApplications' });

// ── RoadmapDay Associations ──
RoadmapDay.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
RoadmapDay.hasMany(Task, { foreignKey: 'roadmap_day_id', as: 'tasks' });
RoadmapDay.hasMany(UserProgress, { foreignKey: 'roadmap_day_id', as: 'userProgress' });

// ── Task Associations ──
Task.belongsTo(RoadmapDay, { foreignKey: 'roadmap_day_id', as: 'roadmapDay' });
Task.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// ── Question Associations ──
Question.hasMany(UserAnswer, { foreignKey: 'question_id', as: 'answers' });
Question.hasMany(Mistake, { foreignKey: 'question_id', as: 'mistakes' });
Question.hasMany(Task, { foreignKey: 'question_id', as: 'tasks' });

// ── UserProgress Associations ──
UserProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserProgress.belongsTo(RoadmapDay, { foreignKey: 'roadmap_day_id', as: 'roadmapDay' });

// ── UserAnswer Associations ──
UserAnswer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserAnswer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
UserAnswer.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// ── TestResult Associations ──
TestResult.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Mistake Associations ──
Mistake.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Mistake.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// ── RevisionSchedule Associations ──
RevisionSchedule.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
RevisionSchedule.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// ── UserLevel Associations ──
UserLevel.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── JobApplication Associations ──
JobApplication.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Task-UserAnswer ──
Task.hasMany(UserAnswer, { foreignKey: 'task_id', as: 'userAnswers' });

module.exports = {
  sequelize,
  User,
  RoadmapDay,
  Task,
  Question,
  UserProgress,
  UserAnswer,
  TestResult,
  Mistake,
  RevisionSchedule,
  UserLevel,
  CompanyMode,
  JobApplication,
};
