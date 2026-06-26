const { validationResult, body } = require('express-validator');
const { User, UserLevel } = require('../models');
const { generateToken, hashPassword, comparePassword, successResponse, errorResponse } = require('../utils/helpers');
const roadmapService = require('../services/roadmapService');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errorResponse('Validation failed', errors.array()));
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json(errorResponse('Email already registered'));
    }

    const password_hash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password_hash,
      start_date: new Date(),
      last_active_date: new Date(),
    });

    await UserLevel.create({ user_id: user.id });

    const token = generateToken(user.id);

    const userData = user.toJSON();
    delete userData.password_hash;

    const level = await UserLevel.findOne({ where: { user_id: user.id } });

    return res.status(201).json(successResponse({
      user: { ...userData, level },
      token,
    }, 'Registration successful'));
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errorResponse('Validation failed', errors.array()));
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: UserLevel, as: 'level' }],
    });

    if (!user) {
      return res.status(401).json(errorResponse('Invalid email or password'));
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json(errorResponse('Invalid email or password'));
    }

    user.last_active_date = new Date();
    await user.save();
    await roadmapService.updateStreak(user);

    const token = generateToken(user.id);

    const userData = user.toJSON();
    delete userData.password_hash;

    return res.json(successResponse({
      user: userData,
      token,
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: UserLevel, as: 'level' }],
    });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    await roadmapService.updateStreak(user);

    return res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errorResponse('Validation failed', errors.array()));
    }

    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json(errorResponse('Email already in use'));
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    const userData = user.toJSON();
    delete userData.password_hash;

    return res.json(successResponse(userData, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  registerValidation,
  loginValidation,
  updateProfileValidation,
};
