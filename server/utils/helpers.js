const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * Generate a JWT token for a given user ID.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Hash a plain-text password.
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain-text password against a bcrypt hash.
 */
async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

/**
 * Build a consistent success response object.
 */
function successResponse(data, message = 'Success') {
  return { success: true, message, data };
}

/**
 * Build a consistent error response object.
 */
function errorResponse(message = 'An error occurred', errors = null) {
  const resp = { success: false, message };
  if (errors) resp.errors = errors;
  return resp;
}

/**
 * Calculate the difference in calendar days between two dates.
 */
function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Get today's date as a Date object with time set to midnight.
 */
function todayMidnight() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Paginate query options for Sequelize.
 */
function paginate(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  successResponse,
  errorResponse,
  daysBetween,
  todayMidnight,
  paginate,
};
