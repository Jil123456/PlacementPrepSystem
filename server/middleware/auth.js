const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User, UserLevel } = require('../models');
const { errorResponse } = require('../utils/helpers');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('Access denied. No token provided.'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json(errorResponse('Access denied. No token provided.'));
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: UserLevel, as: 'level' }],
    });

    if (!user) {
      return res.status(401).json(errorResponse('User not found. Token is invalid.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse('Token has expired. Please login again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(errorResponse('Invalid token. Please login again.'));
    }
    return res.status(500).json(errorResponse('Authentication error.'));
  }
};

module.exports = { authenticate: auth };
